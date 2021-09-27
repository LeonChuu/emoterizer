const { Transformation, PseudoGif } = require('emoterizer-transformations')
const got = require('got')
const Jimp = require('jimp')
const { GifUtil, GifCodec, GifFrame, BitmapImage } = require('gifwrap')
exports.handler = async (event) => {
    const codec = new GifCodec()
    // TODO implement
    const asd = new PseudoGif([], 10, 10)
    if(event.url == null) {
        const response = {
            statusCode: 200,
            body: JSON.stringify(asd),
        };
        return response;
    }
    const buffer = Buffer.from((await got(event.url)).rawBody.buffer)
    const transformed = await Transformation.transform(await codec.decodeGif(buffer), 'roll', {})
    const gif = await Transformation.generateGif(transformed)
    
        const response = {
            statusCode: 200,
            body: gif.buffer,
        };
        return response;

};

