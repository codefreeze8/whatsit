// Resize.js
// Filipe Laborde: added custom sizing parameter

const sharp = require('sharp');
const uuidv4 = require('uuid/v4');
const path = require('path');

class Resize {
  constructor( params ) {
    // folder relative to base path
    this.folder = path.join(__dirname, params.path);
    [ this.sizeX,this.sizeY ] = params.size.replace(' ','').split('x');
  }
  async save(buffer) {
    const filename = Resize.filename();
    const filepath = this.filepath(filename);

    // operations see: http://sharp.pixelplumbing.com/en/stable/api-operation/#parameters_7
    await sharp(buffer)
      .rotate() // uses EXIF to auto-rotate depending on phone orientation
      .resize(parseInt(this.sizeX), parseInt(this.sizeY), 
        { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFile(filepath);
    
    return filename;
  }
  static filename() {
    return `${uuidv4()}.png`;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`)
  }
}
module.exports = Resize;