/**
 * Script para copiar dependencias de node_modules a static/libs
 * Uso: npm run copy-libs
 */

const fs = require('fs-extra');
const path = require('path');

const nodeModules = path.join(__dirname, 'node_modules');
const staticLibs = path.join(__dirname, '..', 'src', 'main', 'resources', 'static', 'libs');

console.log('Copiando dependencias frontend a static/libs...\n');

// Crear carpeta libs si no existe
fs.ensureDirSync(staticLibs);

try {
    // Bootstrap CSS
    console.log('Copiando Bootstrap CSS...');
    fs.copySync(
        path.join(nodeModules, 'bootstrap', 'dist', 'css', 'bootstrap.min.css'),
        path.join(staticLibs, 'bootstrap', 'css', 'bootstrap.min.css')
    );
    fs.copySync(
        path.join(nodeModules, 'bootstrap', 'dist', 'css', 'bootstrap.min.css.map'),
        path.join(staticLibs, 'bootstrap', 'css', 'bootstrap.min.css.map')
    );

    // Bootstrap JS
    console.log('Copiando Bootstrap JS...');
    fs.copySync(
        path.join(nodeModules, 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js'),
        path.join(staticLibs, 'bootstrap', 'js', 'bootstrap.bundle.min.js')
    );
    fs.copySync(
        path.join(nodeModules, 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js.map'),
        path.join(staticLibs, 'bootstrap', 'js', 'bootstrap.bundle.min.js.map')
    );

    // Bootstrap Icons CSS
    console.log('Copiando Bootstrap Icons...');
    fs.copySync(
        path.join(nodeModules, 'bootstrap-icons', 'font', 'bootstrap-icons.min.css'),
        path.join(staticLibs, 'bootstrap-icons', 'bootstrap-icons.min.css')
    );

    // Bootstrap Icons Fonts
    fs.copySync(
        path.join(nodeModules, 'bootstrap-icons', 'font', 'fonts'),
        path.join(staticLibs, 'bootstrap-icons', 'fonts')
    );

    // Chart.js
    console.log('Copiando Chart.js...');
    fs.copySync(
        path.join(nodeModules, 'chart.js', 'dist', 'chart.umd.js'),
        path.join(staticLibs, 'chart.js', 'chart.umd.js')
    );

    console.log('¡Dependencias copiadas exitosamente!');
    console.log('Ubicación: src/main/resources/static/libs/\n');

} catch (error) {
    console.error('Error al copiar dependencias:', error);
    process.exit(1);
}
