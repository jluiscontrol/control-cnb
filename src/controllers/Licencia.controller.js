const fetch = require('node-fetch');

async function fetchDataFromApi(accessToken) {
    const apiUrl = 'https://sacc.sistemascontrol.ec/api_control_identificaciones/public/licencia-web/search';
    const requestBody = {
        client_id: accessToken.getClient().getIdentifier()
    };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjMzMjMwMDM5MTc3LCJhdWQiOiJkMTM5MjhlYzAwMDg4Nzg0ZWMyOTA5MWNmMWM4OWJiN2JlMzAwOGE2IiwiZGF0YSI6eyJ1c3VhcmlvSWQiOiIxIiwibm9tYnJlIjoiQ09OVFJPTCJ9fQ.JcCt-17CJa8KZLWK1BzetcgReAksrlHFXoDug0fNaVk',
        'Accept-X-Control-Y': 'controlsistemasjl.com'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Usa la función pasando el objeto de acceso al token
const accessToken = obtenerAccessToken(); // Asegúrate de tener esta función implementada para obtener el accessToken
fetchDataFromApi(accessToken)
    .then(result => {
        if (result) {
            // La solicitud se completó con éxito
            console.log(result);
        } else {
            // Manejar el error de solicitud API fallida
            console.log('Error: solicitud API fallida');
        }
    })
    .catch(error => {
        // Manejar errores de forma global
        console.error('Error:', error);
    });
