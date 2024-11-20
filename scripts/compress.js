const fs = require('fs');
const path = require('path');
const uglifyjs = require('uglify-js');
const CleanCSS = require('clean-css'); // Importar CleanCSS

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

// Función para procesar la compresión, ofuscación y copia de archivos
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
      } else if (file.endsWith('.css')) {
        // Minificar y escribir CSS
        const inputCSS = fs.readFileSync(inputFilePath, 'utf8');
        const outputCSS = new CleanCSS().minify(inputCSS);

        if (outputCSS.errors.length > 0) {
          console.error(`Error minifying CSS ${file}: `, outputCSS.errors);
          return;
        }

        ensureDirectoryExistence(outputFilePath);
        fs.writeFileSync(outputFilePath, outputCSS.styles, 'utf8');
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