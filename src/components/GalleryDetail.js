import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ENTRYPOINT, THUMB } from '../config/entrypoint';
import { ComposeMediaSize } from '../utils/mediaSize';
import axios from 'axios';
import { ImageList, ImageListItem } from '@mui/material';

const GalleryDetail = () => {
    const location = useLocation();
    if (location.state == null) {
        location.state = {}
        location.state.gpage = 0
        location.state.gpageSize = 50
    }
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get('page'), 10) || 0;
    const initialPageSize = parseInt(searchParams.get('pageSize'), 10) || 50;
    const initialGPage = parseInt(searchParams.get('gpage'), 10) || location.state.gpage;
    const initialGPageSize = parseInt(searchParams.get('gpageSize'), 10) || location.state.gpageSize;

    const [photos, setPhotos] = useState([]);
    const [galleryInfo, setGalleryInfo] = useState({});
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [gpage, setGPage] = useState(initialGPage);
    const [gpageSize, setGPageSize] = useState(initialGPageSize);

    useEffect(() => {
        const fetchPhotos = (page, pageSize) => {
            const start = page * pageSize;
            const end = start + pageSize;
            axios.get(`${ENTRYPOINT}/gallery/${id}?_start=${start}&_end=${end}&_sort=date`)
                .then(response => {
                    console.log(response.data);
                    const totalCount = response.headers['x-total-count'];
                    console.log('Total Count:', totalCount);
                    setGalleryInfo({
                        displayName: response.data.displayName,
                        tags: response.data.tags,
                        totalCount: totalCount,
                    });
                    setPhotos(response.data.Images);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de la galerie : ', error);
                });
        };
        setSearchParams({ page, pageSize, gpage, gpageSize });
        fetchPhotos(page, pageSize);
    }, [id, page, pageSize, gpage, gpageSize, setSearchParams]);

    const handleClick = (index, galleryId) => {
        navigate('/photo/full', { state: { index, galleryId, page, pageSize, gpage, gpageSize } });
    };

    const handlePrev = () => {
        if (page > 0) {
            setPage(page - 1);
        }
        setGPage(gpage);
    };

    const handleNext = () => {
        setPage(page + 1);
        setGPage(gpage);
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setPageSize(newSize);
        setGPageSize(gpageSize);
        setPage(0);
    };

    const backUrl = `/?gpage=${gpage}&gpageSize=${gpageSize}`;

    // Adaptation du nombre de colonnes en fonction de la largeur de la fenêtre
    const {cols, thumbWidth} = ComposeMediaSize("contentScreenSize", "contentScreenCols");

    return (
        <div style={{ padding: '20px' }}>
            <h1>Détails de la galerie : {galleryInfo.displayName || 'Galerie inconnue'}</h1>
            <p>Tags: {galleryInfo.tags || '-'}</p>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="pageSizeSelector">Nombre d'images par page: </label>
                <select id="pageSizeSelector" value={pageSize} onChange={handlePageSizeChange}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <ImageList variant="masonry" cols={cols} gap={8}>
                {photos.map((image, index) => {
                    const thumbnail = THUMB + `/${image.galleryId}/${image.id}/${image.hash}/${thumbWidth}`;
                    return (
                        <ImageListItem
                            key={index}
                            onClick={() => handleClick(index, image.galleryId)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src={thumbnail}
                                alt={`${index}`}
                                style={{
                                    cursor: 'pointer',
                                    objectFit: 'contain'
                                }}
                            />
                        </ImageListItem>
                    );
                })}
            </ImageList>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                { page > 0 && (
                    <button onClick={handlePrev} style={{ marginRight: '10px' }}>
                        Précédent
                    </button>
                )}
                { ((page + 1) * pageSize) < Number(galleryInfo.totalCount) && (
                    <button onClick={handleNext}>
                        Suivant
                    </button>
                )}
            </div>
            <div style={{ marginTop: '20px' }}>
                <Link to={backUrl} style={{ color: 'white' }}>
                    Retour aux galeries
                </Link>
            </div>
        </div>
    );
};

export default GalleryDetail;