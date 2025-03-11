import { useMediaQuery } from '@mui/material';
import Settings from './settings';

export function ComposeMediaSize(screenSize, screenCols) {
    const ChoosenScreenSize = Settings.getSettings(screenSize);
    const ChoosenScreenCols = Settings.getSettings(screenCols);

    // Adaptation du nombre de colonnes en fonction de la largeur de la fenêtre
    const [small, medium, high] = ChoosenScreenSize.split(',');
    const [smallCols, mediumCols, highCols] = ChoosenScreenCols.split(',').map(Number);
    const isSmallScreen = useMediaQuery(`(max-width:${small}px)`);
    const isMediumScreen = useMediaQuery(`(max-width:${medium}px)`);
    const isHighScreen = useMediaQuery(`(max-width:${high}px)`);
    var cols = 0;
    var thumbWidth = 0;
 console.log(useMediaQuery('print'))
    if (isSmallScreen) {
        cols = smallCols
        thumbWidth = Math.floor(small / cols) - (8*(cols-1))
    } else if (isMediumScreen) {
        cols = mediumCols
        thumbWidth = Math.floor(medium / cols) - (8*(cols-1))
    } else if (isHighScreen) {
        cols = highCols
        thumbWidth = Math.floor(high / cols) - (8*(cols-1))
    } else {
        cols = highCols+1
        thumbWidth = Math.floor(2056 / cols) - (8*(cols-1))
    }
    return { cols, thumbWidth };
}