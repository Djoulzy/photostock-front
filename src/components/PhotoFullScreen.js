import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ENTRYPOINT, IMAGE } from '../config/entrypoint';
import axios from 'axios';
import OpenSeadragon from 'openseadragon';

const PhotoFullScreen = () => {
    const location = useLocation();
    // Récupère photoSrc, galleryId, page et pageSize depuis location.state
    const { index, galleryId, page, pageSize, gpage, gpageSize } = location.state || {};
    const viewerRef = useRef(null);
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        const fetchPhotos = (page, pageSize) => {
            const start = page * pageSize;
            const end = start + pageSize;
            axios.get(`${ENTRYPOINT}/gallery/${galleryId}?_start=${start}&_end=${end}&_sort=date`)
                .then(response => {
                    let photos = [];
                    response.data.Images.forEach(image => {
                        photos.push({
                            type: 'image',
                            url: `${IMAGE}/${image.Full}`,
                            buildPyramid: false
                        })
                    })
                    setPhotos(photos);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de la galerie : ', error);
                });
        };
        if (photos.length === 0) fetchPhotos(page, pageSize);
        if (photos.length && viewerRef.current) {
            const viewer = OpenSeadragon({
                element: viewerRef.current,
                prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
                tileSources: photos,
                sequenceMode: true,
                showNavigator: false,
                animationTime: 0.5,
            });
            viewer.goToPage(index);
            return () => {
                if (viewer && viewer.destroy) {
                    viewer.destroy();
                }
            };
        }
    }, [photos, page, pageSize, index, galleryId]);

    if (photos.length === 0) {
        return (
            <div>
                <p>Aucune photo à afficher</p>
                <Link to="/">Retour</Link>
            </div>
        );
    }

    // Construit l'URL de retour en ajoutant les paramètres de pagination dans la query string
    const backUrl = galleryId ? `/gallery/${galleryId}?page=${page}&pageSize=${pageSize}&gpage=${gpage}&gpageSize=${gpageSize}` : '/';

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            backgroundColor: 'black',
            position: 'relative'
        }}>
            <div
                ref={viewerRef}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px'
            }}>
                <Link
                    to={backUrl}
                    style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}
                >
                    Retour
                </Link>
            </div>
        </div>
    );
};

export default PhotoFullScreen;