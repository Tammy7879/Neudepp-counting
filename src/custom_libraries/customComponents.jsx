import { GridOverlay } from '@material-ui/data-grid';

export function CustomNoRowsOverlay(msg) {
    return (
        <GridOverlay>
            <label>{msg}</label>
        </GridOverlay>
    )
}