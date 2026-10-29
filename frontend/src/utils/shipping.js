export const calcularCostoEnvio = (items = [], subtotal) => {
    const totalProductos = Number.isFinite(subtotal)
        ? subtotal
        : items.reduce((total, item) => {
            const precio = Number(item.precioUnitario || item.precioVenta || item.precio || 0);
            return total + precio * (Number(item.cantidad) || 1);
        }, 0);

    if (totalProductos > 130000) {
        return 0;
    }

    const incluyeMatera = items.some(item =>
        String(item.categoria || item.producto?.categoria || '')
            .trim()
            .toLowerCase()
            .includes('matera')
    );

    return incluyeMatera ? 15000 : 12000;
};
