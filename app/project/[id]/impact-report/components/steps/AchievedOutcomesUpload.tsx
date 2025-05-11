/* --- UploadImagesForOutcome.tsx ----------------------------------------- */
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { arrayUnion, doc, updateDoc, getDoc } from "firebase/firestore";
import { storage, db } from "../../../../../../firebase"; // <-- your init file
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Define a type for the file metadata
interface FileMetadata {
  url: string;
  fileName: string;
  uploadedAt: string;
}

interface Props {
  charityId: string;   // e.g. "Red Cross"
  projectId: string;   // Firestore doc ID
  outcomeNo: 1 | 2 | 3;
  isViewMode: boolean;
  existingUrls: FileMetadata[];      // already‑saved URLs (max 5)
  onImagesChange: (images: FileMetadata[]) => void; // Callback to update form value
}

export function UploadImagesForOutcome({
  charityId,
  projectId,
  outcomeNo,
  isViewMode,
  existingUrls = [],
  onImagesChange,
}: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>(existingUrls);
  const [hasInitialSync, setHasInitialSync] = useState(false);

  // Helper function to check if two arrays of FileMetadata are equivalent
  const areImagesEqual = (arr1: FileMetadata[], arr2: FileMetadata[]) => {
    if (arr1.length !== arr2.length) return false;
    
    const urlSet1 = new Set(arr1.map(img => img.url));
    const urlSet2 = new Set(arr2.map(img => img.url));
    
    if (urlSet1.size !== urlSet2.size) return false;
    
    for (const url of urlSet1) {
      if (!urlSet2.has(url)) return false;
    }
    
    return true;
  };

  // Fetch latest images from Firestore when component mounts - only once
  useEffect(() => {
    if (hasInitialSync) return; // Skip if we've already done the initial sync
    
    const syncWithFirestore = async () => {
      try {
        const projectRef = doc(
          db,
          "charities",
          charityId,
          "projects",
          projectId
        );
        
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          const firestoreImages = (projectDoc.data()?.impactReport?.[`outcome${outcomeNo}Images`] || []) as FileMetadata[];
          
          // Check if we need to update by comparing
          if (!areImagesEqual(firestoreImages, existingUrls)) {
            setUploadedFiles(firestoreImages);
            // Use a ref instead of a direct call to avoid dependency issues
            if (hasInitialSync === false) { // Only call during initial sync
              onImagesChange(firestoreImages);
            }
          }
        }
        
        setHasInitialSync(true);
      } catch (err) {
        console.error("Error syncing with Firestore:", err);
        setHasInitialSync(true); // Set to true even on error to prevent retries
      }
    };
    
    syncWithFirestore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charityId, projectId, outcomeNo, hasInitialSync]);

  // Update local state when existingUrls change, but only after initial sync
  useEffect(() => {
    if (hasInitialSync && !areImagesEqual(existingUrls, uploadedFiles)) {
      setUploadedFiles(existingUrls);
    }
  }, [existingUrls, hasInitialSync, uploadedFiles]);
  
  // Only call onImagesChange when uploadedFiles changes due to user actions
  const updateParentForm = (files: FileMetadata[]) => {
    if (hasInitialSync) {
      onImagesChange(files);
    }
  };

  // ----- handler ---------------------------------------------------------
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // ensure we never go beyond 20 images
    if (uploadedFiles.length + files.length > 20) {
      toast.error("You can upload a maximum of 20 images for this outcome.");
      return;
    }

    // upload each file sequentially (simpler progress logic)
    setUploading(true);
    const newUploadedFiles = [...uploadedFiles]; // Create a copy to update

    try {
      for (const file of Array.from(files)) {
        const storagePath = `supporting-images/${charityId}/${projectId}/outcome${outcomeNo}/${file.name}`;
        const storageRef  = ref(storage, storagePath);

        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file);
          task.on(
            "state_changed",
            snap =>
              setProgress(
                Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              ),
            reject,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);

              /* push URL into Firestore */
              const projectRef = doc(
                db,
                "charities",
                charityId,
                "projects",
                projectId
              );

              const fileMetadata = {
                url,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
              };

              // Update Firestore
              await updateDoc(projectRef, {
                [`impactReport.outcome${outcomeNo}Images`]:
                  arrayUnion(fileMetadata),
              });

              // Add to our local array
              newUploadedFiles.push(fileMetadata);
              
              resolve();
            }
          );
        });
      }
      
      // Update state once after all uploads complete
      setUploadedFiles(newUploadedFiles);
      
      // Update parent form
      updateParentForm(newUploadedFiles);
      
      toast.success("Images uploaded!");
    } catch (err: unknown) {
      console.error(err);
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = ""; // reset file input
    }
  };

  // Remove an uploaded file
  const handleRemoveFile = async (indexToRemove: number) => {
    const fileToRemove = uploadedFiles[indexToRemove];
    
    try {
      // Remove from Firestore
      const projectRef = doc(
        db,
        "charities",
        charityId,
        "projects",
        projectId
      );
      
      // Get the current array of images from Firestore
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const supportingImages = projectDoc.data()?.impactReport?.[`outcome${outcomeNo}Images`] || [];
        
        // Filter out the image to be removed
        const updatedImages = supportingImages.filter(
          (img: FileMetadata) => img.url !== fileToRemove.url
        );
        
        // Update Firestore with the new array
        await updateDoc(projectRef, {
          [`impactReport.outcome${outcomeNo}Images`]: updatedImages,
        });
      }
      
      // Update local state
      const newFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
      setUploadedFiles(newFiles);
      
      // Update parent form directly
      updateParentForm(newFiles);
      
      toast.success("File removed from your submission");
    } catch (err: Error | unknown) {
      console.error("Error removing file:", err);
      toast.error(`Failed to remove file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  /* VIEW ----------------------------------------------------------------- */
  if (isViewMode) {
    // In view mode, just show the list of uploaded images
    return uploadedFiles.length > 0 ? (
      <div className="space-y-2">
        <p className="text-sm font-medium">Supporting Images</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-md overflow-hidden">
              <Image 
                src={file.url} 
                alt={`Supporting image ${index + 1} for outcome ${outcomeNo}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Supporting Images</label>

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mb-2">
          <p className="text-xs text-muted-foreground">Uploaded files:</p>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center">
                <FileImage className="h-4 w-4 mr-2 text-blue-500" />
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {file.fileName}
                </a>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload new files - only show if we have fewer than 20 files */}
      {uploadedFiles.length < 20 && (
        <>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id={`fileInput-outcome${outcomeNo}`}
            onChange={handleFileChange}
          />
          <label
            htmlFor={`fileInput-outcome${outcomeNo}`}
            className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Drag & drop or click to select up to&nbsp;
              {20 - uploadedFiles.length} image
              {20 - uploadedFiles.length === 1 ? "" : "s"}
            </span>
          </label>

          {isUploading && (
            <Progress value={progress} className="h-2 w-full" />
          )}
          <p className="text-xs text-muted-foreground">
            Max 20 images &nbsp;|&nbsp; JPG/PNG/WebP recommended
          </p>
        </>
      )}
    </div>
  );
}
