const fs = require('fs');
const path = require('path');
const uglifyjs = require('uglify-js');

const inputDir = 'dist'; // Directorio de entrada
const outputDir = 'static'; // Directorio de salida

// Función para asegurarse de que el directorio de salida exista
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Función para procesar la compresión y copia de archivos
function processDirectory(inputDir, outputDir) {
  fs.readdirSync(inputDir).forEach(file => {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file);
    
    if (fs.lstatSync(inputFilePath).isDirectory()) {
      // Procesar subdirectorio
      processDirectory(inputFilePath, outputFilePath);
    } else {
      if (file.endsWith('.js')) {
        // Minificar y escribir JS
        const result = uglifyjs.minify(fs.readFileSync(inputFilePath, 'utf8'));
        
        if (result.error) {
          console.error(`Error minifying ${file}: `, result.error);
          return;
        }

        ensureDirectoryExistence(outputFilePath);
        fs.writeFileSync(outputFilePath, result.code, 'utf8');
        console.log(`Minified ${outputFilePath}`);
      } else {
        // Copiar otros archivos
        ensureDirectoryExistence(outputFilePath);
        fs.copyFileSync(inputFilePath, outputFilePath);
        console.log(`Copied ${outputFilePath}`);
      }
    }
  });
}

// Garantizar que el directorio de salida existe antes de empezar
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

processDirectory(inputDir, outputDir);