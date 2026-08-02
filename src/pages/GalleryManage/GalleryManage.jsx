import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { useAuth } from '@/hooks/useAuth';
import { getAlbums, getImagesByAlbum } from '@/services/gallery';
import AlbumForm from './components/AlbumForm';
import Uploader from './components/Uploader';
import ImageManagerGrid from './components/ImageManagerGrid';
import './GalleryManage.css';

export default function GalleryManage() {
  const { signOut, user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [images, setImages] = useState([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  function loadAlbums() {
    setIsLoadingAlbums(true);
    return getAlbums()
      .then(setAlbums)
      .finally(() => setIsLoadingAlbums(false));
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (!selectedAlbumId) {
      setImages([]);
      return;
    }
    setIsLoadingImages(true);
    getImagesByAlbum(selectedAlbumId)
      .then(setImages)
      .finally(() => setIsLoadingImages(false));
  }, [selectedAlbumId]);

  function handleAlbumCreated(album) {
    setAlbums((prev) => [album, ...prev]);
    setSelectedAlbumId(album.id);
  }

  function handleImageUploaded(image) {
    setImages((prev) => [...prev, image]);
  }

  function handleImageDeleted(imageId) {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="gallery-manage-page">
      <div className="container">
        <div className="gallery-manage-page__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="gallery-manage-page__title">Manage Gallery</h1>
          </div>
          <div className="gallery-manage-page__account">
            <span>{user?.email}</span>
            <button type="button" className="btn btn-outline" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
        <SectionDivider />

        <div className="gallery-manage-page__layout">
          <AlbumForm onCreated={handleAlbumCreated} />

          <div className="gallery-manage-page__workspace">
            <label className="gallery-manage-page__album-select">
              <span>Album</span>
              {isLoadingAlbums ? (
                <Loader label="Loading albums" />
              ) : (
                <select
                  value={selectedAlbumId}
                  onChange={(e) => setSelectedAlbumId(e.target.value)}
                >
                  <option value="">Select an album…</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              )}
            </label>

            {selectedAlbumId && (
              <>
                <Uploader albumId={selectedAlbumId} onUploaded={handleImageUploaded} />

                {isLoadingImages ? (
                  <Loader label="Loading photos" />
                ) : (
                  <ImageManagerGrid images={images} onDeleted={handleImageDeleted} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
