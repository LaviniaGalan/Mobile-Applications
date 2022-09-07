import {useCamera} from "@ionic/react-hooks/camera";
import {useEffect, useState} from "react";
import {CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory} from "@capacitor/core";
import {base64FromPath, useFilesystem} from "@ionic/react-hooks/filesystem";
import {useStorage} from "@ionic/react-hooks/storage";

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery() {
    const { getPhoto } = useCamera();
    const [photos, setPhotos] = useState<Photo[]>([]);

    const takePhoto = async () => {
        try {
            const cameraPhoto = await getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                quality: 100
            });
            const fileName = new Date().getTime() + '.jpeg';
            const savedFileImage = await savePicture(cameraPhoto, fileName);
            const newPhotos = [savedFileImage, ...photos];
            setPhotos(newPhotos);
            set(PHOTO_STORAGE, JSON.stringify(newPhotos));
            return savedFileImage.webviewPath;
        } catch (error) {
            return '';
        }

    };

    const { readFile, writeFile } = useFilesystem();
    const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
        const base64Data = await base64FromPath(photo.webPath!);
        await writeFile({
            path: fileName,
            data: base64Data,
            directory: FilesystemDirectory.Data,
            recursive: true
        });

        return {
            filepath: fileName,
            webviewPath: base64Data
        };
    };

    const { get, set } = useStorage();
    useEffect(() => {
        const loadSaved = async () => {
            const photosString = await get(PHOTO_STORAGE);
            const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
            for (let photo of photos) {
                try {
                    const file = await readFile({
                        path: photo.filepath,
                        directory: FilesystemDirectory.Data
                    });
                    photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
                } catch (error) {
                    setPhotos([]);
                    return;
                }

            }
            setPhotos(photos);
        };
        loadSaved();
    }, [get, readFile]);

    return {
        photos: photos,
        takePhoto: takePhoto
    };
}
