import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ENTRYPOINT, THUMB } from '../config/entrypoint';
import Settings from '../utils/settings';
import { ComposeMediaSize } from '../utils/mediaSize';
import axios from 'axios';
import { ImageList, ImageListItem, ImageListItemBar, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { checkPassword, isLogged } from '../utils/checkPass';

const GalleryList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialGPage = parseInt(searchParams.get('gpage'), 10) || 0;
    const initialGPageSize = parseInt(searchParams.get('gpageSize'), 10) || 50;

    const [galleries, setGalleries] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [gpage, setGpage] = useState(initialGPage);
    const [gpageSize, setGpageSize] = useState(initialGPageSize);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [password, setPassword] = useState('');

    // New states for editing gallery's displayName via popup
    const [openInfoDialog, setOpenInfoDialog] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [currentDisplayName, setCurrentDisplayName] = useState("");
    const [currentCopyright, setCurrentCopyright] = useState("");

    const [selectedForFilter, setSelectedForFilter] = useState([]);

    useEffect(() => {
        const fetchGalleries = (gpage, gpageSize) => {
            const start = gpage * gpageSize;
            const end = start + gpageSize;
            axios.get(`${ENTRYPOINT}/gallery?_start=${start}&_end=${end}&_sort=date`)
                .then(response => {
                    const totalCountHeader = response.headers['x-total-count'];
                    setTotalCount(totalCountHeader);
                    setGalleries(response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des galeries : ', error);
                });
        };
        setSearchParams({ gpage, gpageSize });
        fetchGalleries(gpage, gpageSize);
    }, [gpage, gpageSize, setSearchParams]);

    const handleClick = (id) => {
        navigate(`/gallery/${id}`, { state: { gpage, gpageSize } });
    };

    const handlePrev = () => {
        if (gpage > 0) {
            setGpage(gpage - 1);
        }
    };

    const handleNext = () => {
        setGpage(gpage + 1);
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setGpageSize(newSize);
        setGpage(0);
    };

    const handleSettingsClick = () => {
        if (isLogged()) {
            navigate('/admin');
        } else {
            setOpenPasswordDialog(true);
        }
    };

    const handleDialogClose = () => {
        setOpenPasswordDialog(false);
        setPassword('');
    };

    const handlePasswordSubmit = async () => {
        const valid = await checkPassword(password);
        if (valid) {
            setOpenPasswordDialog(false);
            setPassword('');
            navigate('/admin');
        } else {
            console.error('Mot de passe incorrect');
            // Optionally, display an error message to the user.
        }
    };

    // Function to open the info dialog to update displayName.
    const handleInfoClick = (gallery) => {
        setSelectedGallery(gallery);
        setCurrentDisplayName(gallery.displayName);
        setCurrentCopyright(gallery.copyRight);
        setOpenInfoDialog(true);
    };

    const handleInfoDialogClose = () => {
        setOpenInfoDialog(false);
        setSelectedGallery(null);
        setCurrentDisplayName("");
        setCurrentCopyright("");
    };

    const handleUpdateGalleryName = () => {
        if (selectedGallery) {
            axios.put(`${ENTRYPOINT}/gallery/${selectedGallery.id}`, { ...selectedGallery, displayName: currentDisplayName, copyRight: currentCopyright })
                .then(response => {
                    const updatedGallery = response.data;
                    setGalleries(prev => prev.map(g => g.id === updatedGallery.id ? updatedGallery : g));
                    handleInfoDialogClose();
                })
                .catch(err => {
                    console.error("Erreur lors de la mise à jour du displayName:", err);
                });
        }
    };

    // Add the delete handler in your component:
    const handleDeleteGallery = () => {
        if (selectedGallery) {
            axios.delete(`${ENTRYPOINT}/gallery/${selectedGallery.id}`)
                .then(response => {
                    setGalleries(prev => prev.filter(g => g.id !== selectedGallery.id));
                    handleInfoDialogClose();
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression de la galerie:", err);
                });
        }
    };

    // Inside your GalleryList component, add the new handler:
    const handleMixGalleries = () => {
        if (selectedForFilter.length === 2) {
            const gallery1 = selectedForFilter[0];
            const gallery2 = selectedForFilter[1];
            axios.post(`${ENTRYPOINT}/gallery/mix`, { srcId: gallery1, destId: gallery2 })
                .then(response => {
                    // Optionally update the state: remove one gallery from the list
                    setGalleries(prev => prev.filter(g => g.id !== gallery1));
                    // Clear the selection after mixing
                    setSelectedForFilter([]);
                    alert("Galleries mixed successfully");
                })
                .catch(err => {
                    console.error("Erreur lors du mix:", err);
                });
        }
    };

    // Adaptation du nombre de colonnes en fonction de la largeur de la fenêtre
    const { cols, thumbWidth } = ComposeMediaSize("galleryScreenSize", "galleryScreenCols");
    if (galleries == null || galleries.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <IconButton onClick={handleSettingsClick} style={{ color: 'white' }}>
                        <SettingsIcon />
                    </IconButton>
                </div>
                Aucun résultat pour les galeries.
            </div>
        );
    }
    return (
        <div style={{ padding: '20px', position: 'relative' }}>
            {/* Bouton settings en haut à droite */}
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <IconButton onClick={handleSettingsClick} style={{ color: 'white' }}>
                    <SettingsIcon />
                </IconButton>
            </div>
            <h1>{Settings.getSettings("appName")}</h1>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="pageSizeSelector">Nombre de galeries par page: </label>
                <select id="pageSizeSelector" value={gpageSize} onChange={handlePageSizeChange}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <ImageList variant="masonry" cols={cols} gap={8}>
                {galleries.map(gallery => {
                    const thumbnail = THUMB + `/${gallery.id}/${gallery.Thumb.id}/${gallery.Thumb.hash}/${thumbWidth}`;
                    return (
                        <ImageListItem
                            key={gallery.id}
                            onClick={() => handleClick(gallery.id)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative' // enable overlay positioning
                            }}
                        >
                            {thumbnail && (
                                <img
                                    src={thumbnail}
                                    alt={`Galerie ${gallery.id}`}
                                    style={{ objectFit: 'none' }}
                                />
                            )}

                            {/* Red overlay with label if gallery is selected */}
                            {selectedForFilter.includes(gallery.id) && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(255, 0, 0, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                    }}
                                >
                                    <span style={{ color: 'white', fontSize: '2em', fontWeight: 'bold' }}>
                                        {selectedForFilter[0] === gallery.id ? "Origine" : 
                                        selectedForFilter[1] === gallery.id ? "Cible" : ""}
                                    </span>
                                </div>
                            )}

                            <ImageListItemBar
                                sx={{
                                    background:
                                        'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                                        'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                }}
                                position="top"
                                title={gallery.displayName}
                                style={{ textAlign: 'left', zIndex: 3 }}
                            />
                            <ImageListItemBar
                                sx={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
                                        'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                }}
                                title={`${gallery.nbItems} items`}
                                subtitle={`@${gallery.copyRight}`}
                                style={{ textAlign: 'left', zIndex: 3 }}
                                actionIcon={
                                    isLogged() && (
                                        <div>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInfoClick(gallery);
                                                }}
                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={`info about ${gallery.displayName}`}
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Toggle selection: if already selected, deselect; else add it if less than 2 galleries are selected.
                                                    if (selectedForFilter.includes(gallery.id)) {
                                                        setSelectedForFilter(selectedForFilter.filter(id => id !== gallery.id));
                                                    } else if (selectedForFilter.length < 2) {
                                                        setSelectedForFilter([...selectedForFilter, gallery.id]);
                                                    }
                                                }}
                                                sx={{ color: selectedForFilter.includes(gallery.id) ? 'red' : 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={`select ${gallery.displayName}`}
                                            >
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </div>
                                    )
                                }
                            />
                        </ImageListItem>
                    );
                })}
            </ImageList>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                {gpage > 0 && (
                    <button onClick={handlePrev} style={{ marginRight: '10px' }}>
                        Précédent
                    </button>
                )}
                {((gpage + 1) * gpageSize) < Number(totalCount) && (
                    <button onClick={handleNext}>
                        Suivant
                    </button>
                )}
            </div>
            {/* Dialog pour la saisie du mot de passe */}
            <Dialog open={openPasswordDialog} onClose={handleDialogClose}>
                <DialogTitle>Mot de passe requis</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Veuillez entrer votre mot de passe pour accéder aux paramètres.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Mot de passe"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Annuler</Button>
                    <Button onClick={handlePasswordSubmit}>Valider</Button>
                </DialogActions>
            </Dialog>
            {/* Dialog pour éditer le displayName de la galerie */}
            <Dialog open={openInfoDialog} onClose={handleInfoDialogClose}>
                <DialogTitle>Modifier le DisplayName et Copyright</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="DisplayName"
                        fullWidth
                        variant="standard"
                        value={currentDisplayName}
                        onChange={(e) => setCurrentDisplayName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Copyright"
                        fullWidth
                        variant="standard"
                        value={currentCopyright}
                        onChange={(e) => setCurrentCopyright(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleInfoDialogClose}>Annuler</Button>
                    {selectedForFilter.length === 2 && (
                        <Button onClick={handleMixGalleries} color="primary">Mix</Button>
                    )}
                    <Button onClick={handleDeleteGallery} color="error">Supprimer</Button>
                    <Button onClick={handleUpdateGalleryName}>Valider</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default GalleryList;