export const useStyles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    dataGrid: {
        '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
            outline: 'none',
        },
        '& .MuiDataGrid-sortIcon': {
            color: 'white',
            margin: 5,
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
        }
    },
});