export const exchangeRateMessages = {
    log: {
        controller: {
            current: 'Obteniendo tasas de cambio actuales',
            currentCurrency: 'Obteniendo tasa de cambio para moneda',
            date: 'Obteniendo tasas para fecha',
            history: 'Obteniendo historial de tasas',
            convert: 'Convirtiendo entre monedas',
            lastUpdate: 'Obteniendo última actualización',
        },
    },
    error: {
        currencyNotFound: 'Moneda no soportada. Monedas disponibles: usd, eur, cny, try, rub',
        dateNotFound: 'No se encontraron tasas para la fecha',
        historyEmpty: 'No hay historial disponible',
        convertNoRate: 'No se pudo realizar la conversión. Una o ambas monedas no están disponibles',
        bcvSourceUnavailable: 'No disponible - sin fuentes disponibles',
    },
    success: {
        convert: 'Conversión realizada exitosamente',
    },
};
