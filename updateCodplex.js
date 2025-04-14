// updateCodplex.js
require('dotenv').config();
const { ProductoUbicacion } = require('./models'); // Modelo local
const dbEmpresa = require('./config/db_empresa');   // Conexión a la base externa
const { QueryTypes } = require('sequelize');

(async () => {
    try {
        // Obtener todos los registros locales
        const registros = await ProductoUbicacion.findAll();
        console.log(`Se encontraron ${registros.length} registros locales.`);
        for (const registro of registros) {
            const codebar = registro.codebar;
            // Consulta en la base externa para obtener el CodPlex
            const productoExterno = await dbEmpresa.query(
                `SELECT CodPlex 
         FROM medicamentos 
         WHERE codebar = :codebar 
           AND Activo = 's'
         LIMIT 1`,
                {
                    replacements: { codebar },
                    type: QueryTypes.SELECT
                }
            );

            if (productoExterno.length > 0) {
                const codplex = productoExterno[0].CodPlex;
                // Actualizar el registro local con el CodPlex obtenido
                await registro.update({ codplex });
                console.log(`Registro ID ${registro.id} actualizado con CodPlex: ${codplex}`);
            } else {
                console.log(`No se encontró producto externo para codebar: ${codebar}`);
            }
        }
        console.log('Proceso de actualización finalizado.');
    } catch (error) {
        console.error('❌ Error en la actualización de codplex:', error);
    }
})();
