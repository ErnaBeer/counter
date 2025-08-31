import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FhevmInstance } from "../utils/fhevm-hooks";
import { GenericStringStorage } from "../utils/GenericStringStorage";
import { FhevmDecryptionSignature } from "../utils/FhevmDecryptionSignature";

// Contract ABI and Address - Update these with your deployed contract
const FHE_COUNTER_ABI = [
  "function getCount() external view returns (bytes32)",
  "function increment(bytes32 encryptedValue, bytes proof) external",
  "function decrement(bytes32 encryptedValue, bytes proof) external",
];

const FHE_COUNTER_ADDRESSES: Record<string, { address: string; chainId: number; chainName: string }> = {
  "11155111": {
    address: "0x4D55AAD4bf74E3167D75ACB21aD9343c46779393", // Deployed with your mnemonic
    chainId: 11155111,
    chainName: "Sepolia"
  },
  "31337": {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local Hardhat address
    chainId: 31337,
    chainName: "Hardhat"
  }
};

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type FHECounterInfoType = {
  abi: typeof FHE_COUNTER_ABI;
  address?: string;
  chainId?: number;
  chainName?: string;
};

function getFHECounterByChainId(chainId: number | undefined): FHECounterInfoType {
  if (!chainId) {
    return { abi: FHE_COUNTER_ABI };
  }

  const entry = FHE_COUNTER_ADDRESSES[chainId.toString()];

  if (!entry || entry.address === ethers.ZeroAddress) {
    return { abi: FHE_COUNTER_ABI, chainId };
  }

  return {
    address: entry?.address,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: FHE_COUNTER_ABI,
  };
}

export const useFHECounter = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [countHandle, setCountHandle] = useState<string | undefined>(undefined);
  const [clearCount, setClearCount] = useState<ClearValueType | undefined>(undefined);
  const clearCountRef = useRef<ClearValueType>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isIncOrDec, setIsIncOrDec] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fheCounterRef = useRef<FHECounterInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isIncOrDecRef = useRef<boolean>(isIncOrDec);

  const isDecrypted = countHandle && countHandle === clearCount?.handle;

  const fheCounter = useMemo(() => {
    const c = getFHECounterByChainId(chainId);
    fheCounterRef.current = c;

    if (!c.address) {
      setMessage(`FHECounter deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!fheCounter) {
      return undefined;
    }
    return (Boolean(fheCounter.address) && fheCounter.address !== ethers.ZeroAddress);
  }, [fheCounter]);

  const canGetCount = useMemo(() => {
    return fheCounter.address && ethersReadonlyProvider && !isRefreshing;
  }, [fheCounter.address, ethersReadonlyProvider, isRefreshing]);

  const refreshCountHandle = useCallback(() => {
    console.log("[useFHECounter] call refreshCountHandle()");
    if (isRefreshingRef.current) {
      return;
    }

    if (
      !fheCounterRef.current ||
      !fheCounterRef.current?.chainId ||
      !fheCounterRef.current?.address ||
      !ethersReadonlyProvider
    ) {
      setCountHandle(undefined);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = fheCounterRef.current.chainId;
    const thisFheCounterAddress = fheCounterRef.current.address;

    const thisFheCounterContract = new ethers.Contract(
      thisFheCounterAddress,
      fheCounterRef.current.abi,
      ethersReadonlyProvider
    );

    thisFheCounterContract
      .getCount()
      .then((value) => {
        console.log("[useFHECounter] getCount()=" + value);
        if (
          sameChain.current?.(thisChainId) &&
          thisFheCounterAddress === fheCounterRef.current?.address
        ) {
          setCountHandle(value);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e) => {
        setMessage("FHECounter.getCount() call failed! error=" + e);

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, sameChain]);

  useEffect(() => {
    refreshCountHandle();
  }, [refreshCountHandle]);

  const canDecrypt = useMemo(() => {
    return (
      fheCounter.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      countHandle &&
      countHandle !== ethers.ZeroHash &&
      countHandle !== clearCount?.handle
    );
  }, [
    fheCounter.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    countHandle,
    clearCount,
  ]);

  const decryptCountHandle = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!fheCounter.address || !instance || !ethersSigner) {
      return;
    }

    if (countHandle === clearCountRef.current?.handle) {
      return;
    }

    if (!countHandle) {
      setClearCount(undefined);
      clearCountRef.current = undefined;
      return;
    }

    if (countHandle === ethers.ZeroHash) {
      setClearCount({ handle: countHandle, clear: BigInt(0) });
      clearCountRef.current = { handle: countHandle, clear: BigInt(0) };
      return;
    }

    const thisChainId = chainId;
    const thisFheCounterAddress = fheCounter.address;
    const thisCountHandle = countHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");

    const run = async () => {
      const isStale = () =>
        thisFheCounterAddress !== fheCounterRef.current?.address ||
        !sameChain.current?.(thisChainId) ||
        !sameSigner.current?.(thisEthersSigner);

      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [fheCounter.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Call FHEVM userDecrypt...");

        const res = await instance.userDecrypt(
          [{ handle: thisCountHandle, contractAddress: thisFheCounterAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setClearCount({ handle: thisCountHandle, clear: res[thisCountHandle] });
        clearCountRef.current = {
          handle: thisCountHandle,
          clear: res[thisCountHandle],
        };

        setMessage(
          "Count handle clear value is " + clearCountRef.current.clear
        );
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    fheCounter.address,
    instance,
    countHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const canIncOrDec = useMemo(() => {
    return (
      fheCounter.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isIncOrDec
    );
  }, [fheCounter.address, instance, ethersSigner, isRefreshing, isIncOrDec]);

  const incOrDec = useCallback(
    (value: number) => {
      if (isRefreshingRef.current || isIncOrDecRef.current) {
        return;
      }

      if (!fheCounter.address || !instance || !ethersSigner || value === 0) {
        return;
      }

      const thisChainId = chainId;
      const thisFheCounterAddress = fheCounter.address;
      const thisEthersSigner = ethersSigner;
      const thisFheCounterContract = new ethers.Contract(
        thisFheCounterAddress,
        fheCounter.abi,
        thisEthersSigner
      );

      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = value > 0 ? value : -value;
      const opMsg = `${op}(${valueAbs})`;

      isIncOrDecRef.current = true;
      setIsIncOrDec(true);
      setMessage(`Start ${opMsg}...`);

      const run = async (op: "increment" | "decrement", valueAbs: number) => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisFheCounterAddress !== fheCounterRef.current?.address ||
          !sameChain.current?.(thisChainId) ||
          !sameSigner.current?.(thisEthersSigner);

        try {
          const input = instance.createEncryptedInput(
            thisFheCounterAddress,
            thisEthersSigner.address
          );
          input.add32(valueAbs);

          const enc = await input.encrypt();

          if (isStale()) {
            setMessage(`Ignore ${opMsg}`);
            return;
          }

          setMessage(`Call ${opMsg}...`);

          const tx: ethers.TransactionResponse =
            op === "increment"
              ? await thisFheCounterContract.increment(
                  enc.handles[0],
                  enc.inputProof
                )
              : await thisFheCounterContract.decrement(
                  enc.handles[0],
                  enc.inputProof
                );

          setMessage(`Wait for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Call ${opMsg} completed status=${receipt?.status}`);

          if (isStale()) {
            setMessage(`Ignore ${opMsg}`);
            return;
          }

          refreshCountHandle();
        } catch {
          setMessage(`${opMsg} Failed!`);
        } finally {
          isIncOrDecRef.current = false;
          setIsIncOrDec(false);
        }
      };

      run(op, valueAbs);
    },
    [
      ethersSigner,
      fheCounter.address,
      fheCounter.abi,
      instance,
      chainId,
      refreshCountHandle,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: fheCounter.address,
    canDecrypt,
    canGetCount,
    canIncOrDec,
    incOrDec,
    decryptCountHandle,
    refreshCountHandle,
    isDecrypted,
    message,
    clear: clearCount?.clear,
    handle: countHandle,
    isDecrypting,
    isRefreshing,
    isIncOrDec,
    isDeployed,
  };
};