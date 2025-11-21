"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "../types";
import { apiFetch } from "@/lib/utils";

export default function Scanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [uploadMethod, setUploadMethod] = useState<
    "upload" | "camera" | "manual" | null
  >(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    name: "",
    quantity: "",
    unit: "piece",
    category: "produce",
    expirationDate: "",
  });

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API not supported in this browser.");
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (err) {
        // Fallback: try any available camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err2) {
          console.error("Failed to access camera (fallback):", err2);
          setCameraError(
            "Unable to access camera. Check permissions and device settings.",
          );
          return;
        }
      }
      if (stream) {
        // Store the stream and flip the flag; the effect will attach it to the video
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Failed to access camera:", error);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  // Ensure video plays when camera becomes active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error("Play error:", err));
    }
  }, [cameraActive]);

  // Auto-start camera when entering camera mode
  useEffect(() => {
    if (uploadMethod === "camera" && !cameraActive && !streamRef.current) {
      startCamera();
    }
  }, [uploadMethod, cameraActive]);

  // Stop camera when leaving camera mode or unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (uploadMethod !== "camera") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    }
  }, [uploadMethod]);

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvasRef.current.toDataURL("image/jpeg");
    // Show preview first, allow user to confirm before processing
    setPreviewImage(imageData);
    // Stop camera so user can inspect the capture
    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      // Show preview first, allow user to confirm before processing
      setPreviewImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Process receipt image via API
  const processReceiptImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // TODO: Implement image interpretation on backend
      // This endpoint should:
      // 1. Receive base64 encoded receipt image
      // 2. Use OCR/ML model to extract item names, quantities, prices
      // 3. Parse ingredients from detected items
      // 4. Return standardized ingredient list with category suggestions
      const response = await apiFetch("/api/scan", {
        method: "POST",
        body: {
          receipt: imageData,
          format: "base64",
        },
      });

      if (!response.ok) throw new Error("Failed to process receipt");

      const data = await response.json();
      setIngredients(data.data || []);
      stopCamera();
    } catch (error) {
      console.error("Failed to process receipt:", error);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPreview = async () => {
    if (!previewImage) return;
    // Send the preview image for processing
    console.log("Confirming preview...");
    await processReceiptImage(previewImage);
    setPreviewImage(null);
  };

  const retake = () => {
    console.log("Retaking photo...");
    setPreviewImage(null);
    if (uploadMethod === "camera") startCamera();
  };

  // Add ingredients to inventory
  const handleAddIngredients = async () => {
    try {
      for (const ingredient of ingredients) {
        await apiFetch("/api/ingredients", {
          method: "POST",
          body: ingredient,
        });
      }
      router.push("/inventory");
    } catch (error) {
      console.error("Failed to add ingredients:", error);
    }
  };

  // Add manual ingredient
  const handleAddManual = async () => {
    if (
      !manualForm.name ||
      !manualForm.quantity ||
      !manualForm.expirationDate
    ) {
      alert("Please fill in all fields");
      return;
    }

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: manualForm.name,
      quantity: parseFloat(manualForm.quantity),
      unit: manualForm.unit as
        | "piece"
        | "g"
        | "ml"
        | "cup"
        | "liter"
        | "bunch"
        | "bottle",
      category: manualForm.category as
        | "produce"
        | "dairy"
        | "meat"
        | "pantry"
        | "frozen"
        | "other",
      expirationDate: new Date(manualForm.expirationDate).toISOString(),
      dateAdded: new Date().toISOString(),
    };

    setIngredients([...ingredients, newIngredient]);
    setManualForm({
      name: "",
      quantity: "",
      unit: "piece",
      category: "produce",
      expirationDate: "",
    });
  };

  if (uploadMethod === "upload" || uploadMethod === "camera") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
          <button
            onClick={() =>
              ingredients.length === 0 ? setUploadMethod(null) : null
            }
            className="mb-4 text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← Back
          </button>

          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {uploadMethod === "camera" ? "Take Photo" : "Upload Receipt"}
          </h1>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800 min-h-96">
            {uploadMethod === "camera" ? (
              <>
                {cameraError && (
                  <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-left text-xs sm:text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {cameraError}
                  </div>
                )}
                {previewImage ? (
                  <>
                    <div className="mb-4 bg-yellow-100 border-4 border-yellow-400 p-4 rounded-lg">
                      <p className="text-sm font-bold text-yellow-800 mb-2">
                        📷 Photo Preview
                      </p>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full rounded-lg max-h-96 object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <button
                        onClick={retake}
                        className="rounded border border-gray-300 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Retake
                      </button>
                      <button
                        onClick={confirmPreview}
                        disabled={isProcessing}
                        className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                      >
                        Confirm & Process
                      </button>
                    </div>
                  </>
                ) : !cameraActive && !isProcessing ? (
                  <>
                    <div className="mb-4 text-4xl sm:text-6xl">📷</div>
                    <p className="mb-4 text-xs sm:text-base text-gray-600 dark:text-gray-400">
                      Click below to open your camera
                    </p>
                    <button
                      onClick={startCamera}
                      className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                      Open Camera
                    </button>
                  </>
                ) : cameraActive && !isProcessing ? (
                  <>
                    <div className="relative mb-4 w-full bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: "100%",
                          height: "384px",
                          display: "block",
                        }}
                        onLoadedMetadata={() => {
                          try {
                            videoRef.current?.play();
                          } catch (e) {
                            console.error("Play error on metadata:", e);
                          }
                        }}
                      />
                      {/* Overlay guides */}
                      <div className="absolute inset-0 rounded-lg pointer-events-none">
                        {/* Corner guides */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-400"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-400"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-400"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-400"></div>

                        {/* Center crosshair */}
                        <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-12 h-12 border-2 border-orange-400 rounded-full opacity-75"></div>
                          <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-orange-400 transform -translate-x-1/2 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-orange-400 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        {/* Focus hint text */}
                        <div className="absolute top-0 left-0 right-0 pt-4">
                          <p className="text-xs sm:text-sm font-medium text-orange-300 drop-shadow-lg">
                            Center the receipt in frame
                          </p>
                        </div>

                        {/* Bottom hint */}
                        <div className="absolute bottom-0 left-0 right-0 pb-4">
                          <p className="text-xs text-orange-300/80 drop-shadow-lg">
                            Ensure good lighting and avoid shadows
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <button
                        onClick={capturePhoto}
                        className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                      >
                        📸 Take Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="rounded border border-gray-300 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 inline-block animate-spin text-3xl sm:text-4xl">
                      ⏳
                    </div>
                    <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                      Processing receipt with AI...
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                {previewImage ? (
                  <>
                    <div className="mb-4 bg-yellow-100 border-4 border-yellow-400 p-4 rounded-lg">
                      <p className="text-sm font-bold text-yellow-800 mb-2">
                        📷 Image Preview
                      </p>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full rounded-lg max-h-96 object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="rounded border border-gray-300 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Choose Another
                      </button>
                      <button
                        onClick={confirmPreview}
                        disabled={isProcessing}
                        className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                      >
                        Confirm & Process
                      </button>
                    </div>
                  </>
                ) : !isProcessing ? (
                  <>
                    <div className="mb-4 text-4xl sm:text-6xl">📁</div>
                    <p className="mb-4 text-xs sm:text-base text-gray-600 dark:text-gray-400">
                      Drag and drop a receipt image here, or click to select
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          console.log("File selected:", e.target.files[0].name);
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </>
                ) : (
                  <>
                    <div className="mb-4 inline-block animate-spin text-3xl sm:text-4xl">
                      ⏳
                    </div>
                    <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                      Processing receipt with AI...
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Detected Ingredients
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {ingredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-base font-medium text-gray-900 dark:text-white break-words">
                        {ingredient.quantity} {ingredient.unit}{" "}
                        {ingredient.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {ingredient.category}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setIngredients(ingredients.filter((_, i) => i !== idx))
                      }
                      className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setIngredients([]);
                    if (uploadMethod === "camera") {
                      startCamera();
                    }
                  }}
                  className="flex-1 rounded border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleAddIngredients}
                  className="flex-1 rounded bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (uploadMethod === "manual") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
          <button
            onClick={() => setUploadMethod(null)}
            className="mb-4 text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← Back
          </button>

          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Add Items Manually
          </h1>
          <p className="mb-4 sm:mb-6 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Type in what you bought, and we'll add it to your inventory.
          </p>

          <div className="space-y-3 sm:space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Item Name
              </label>
              <input
                type="text"
                placeholder="e.g., Tomatoes"
                value={manualForm.name}
                onChange={(e) =>
                  setManualForm({ ...manualForm, name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={manualForm.quantity}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, quantity: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Unit
                </label>
                <select
                  value={manualForm.unit}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, unit: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  <option>piece</option>
                  <option>g</option>
                  <option>ml</option>
                  <option>cup</option>
                  <option>liter</option>
                  <option>bunch</option>
                  <option>bottle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Category
              </label>
              <select
                value={manualForm.category}
                onChange={(e) =>
                  setManualForm({ ...manualForm, category: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              >
                <option>produce</option>
                <option>dairy</option>
                <option>meat</option>
                <option>pantry</option>
                <option>frozen</option>
                <option>other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Expiration Date
              </label>
              <input
                type="date"
                value={manualForm.expirationDate}
                onChange={(e) =>
                  setManualForm({
                    ...manualForm,
                    expirationDate: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleAddManual}
              className="w-full rounded bg-orange-500 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Add Item
            </button>

            {ingredients.length > 0 && (
              <div className="mt-4 sm:mt-6 border-t border-gray-300 pt-4 dark:border-gray-700">
                <h3 className="mb-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Items to Add ({ingredients.length})
                </h3>
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
                    >
                      <span className="break-words">
                        {ing.quantity} {ing.unit} {ing.name}
                      </span>
                      <button
                        onClick={() =>
                          setIngredients(
                            ingredients.filter((_, i) => i !== idx),
                          )
                        }
                        className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setUploadMethod(null);
                setIngredients([]);
              }}
              className="flex-1 rounded border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddIngredients}
              disabled={ingredients.length === 0}
              className="flex-1 rounded bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Save Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main content */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Scan Receipt 📸
          </h1>
          <p className="mb-6 sm:mb-8 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Add groceries to your inventory by scanning a receipt or uploading
            an image.
          </p>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setUploadMethod("camera")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">📷</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Take Photo
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Use your camera to take a photo of your receipt
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("upload")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">📁</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Upload File
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Upload an existing receipt image from your device
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("manual")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">✏️</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Add Manually
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Type in items you bought manually
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
