// Resize.js
// Filipe Laborde: added custom sizing parameter

const sharp = require('sharp');
const path = require('path');

class Resize {
  constructor( params ) {
    // folder relative to base path
    this.folder = path.join(__dirname, params.path);
    [ this.sizeX,this.sizeY ] = params.size.replace(' ','').split('x');
    this.filename = params.f
  }
  async save(buffer) {
    // operations see: http://sharp.pixelplumbing.com/en/stable/api-operation/#parameters_7
    await sharp(buffer)
      .rotate() // uses EXIF to auto-rotate depending on phone orientation
      .resize(parseInt(this.sizeX), parseInt(this.sizeY), 
        { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFile( path.resolve(`${this.folder}/${this.filename}` );
    
    return this.filename;
  }
}
module.exports = Resize;