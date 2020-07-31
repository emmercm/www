'use strict';

const msIf = require('metalsmith-if');

const branch = require('metalsmith-branch');
const sharp  = require('metalsmith-sharp');

const lossless = {
    namingPattern: '{dir}{name}.png',
    moveFile: true,
    methods: [{
        name: 'png',
        args: {
            compressionLevel: 0,
            quality: 100
        }
    }]
};

const compressed = {
    namingPattern: '{dir}{name}.jpg',
    moveFile: true,
    methods: [
        {
            name: 'flatten',
            args: {
                background: '#dee2e6' // $gray-300, halfway to $secondary ($gray-600)
            }
        },
        {
            name: 'jpeg',
            args: metadata => {
                // 50kb->100, 500kb->60
                const quality = Math.floor(Math.min(Math.max((-4 / 45) * (metadata.size / 1024) + (940 / 9), 60), 100));
                return [{
                    chromaSubsampling: quality < 90 ? '4:4:4' : '4:2:0',
                    overshootDeringing: true,
                    quality
                }]
            }
        }
    ]
};

module.exports.blogImage = (glob, width, height, prod) => {
    return branch(glob)
        // .use(sharp({
        //     // Enlarge vector images
        //     // https://github.com/axe312ger/metalsmith-sharp/issues/108
        //     src: '**/*.svg',
        //     namingPattern: '{dir}{name}.png',
        //     moveFile: true,
        //     methods: [{
        //         name: 'resize',
        //         args: [
        //             width,
        //             height,
        //             {
        //                 kernel: 'cubic',
        //                 fit: 'inside'
        //             }
        //         ]
        //     }]
        // }))
        .use(sharp({
            // Rasterize vector images
            src: '**/*.svg',
            ...lossless
        }))
        .use(msIf(prod, sharp({
            // Preserve quality during processing
            src: '**/*.!(png)',
            ...lossless
        })))
        // .use(sharp({
        //     // Trim image borders
        //     src: 'static/img/blog/*',
        //     methods: [{
        //         name: 'trim'
        //     }]
        // }))
        .use(sharp({
            // Downsize large images
            src: '**/*',
            methods: [{
                name: 'resize',
                args: [
                    width,
                    height,
                    {
                        fit: 'outside',
                        kernel: 'lanczos3',
                        withoutEnlargement: true
                    }
                ]
            }]
        }))
        .use(sharp({
            // Crop large images
            src: '**/*',
            methods: [{
                name: 'resize',
                args: [
                    width,
                    height,
                    {
                        fit: 'cover',
                        position: 0,
                        withoutEnlargement: true
                    }
                ]
            }]
        }))
        // .use(sharp({
        //     // Pad small images
        //     src: '**/*',
        //     methods: [{
        //         name: 'extend',
        //         args: metadata => {
        //             const y = Math.max(height - metadata.height, 0);
        //             const x = Math.max(width - metadata.width, 0);
        //             return [{
        //                 top: Math.floor(y / 2),
        //                 left: Math.floor(x / 2),
        //                 bottom: Math.ceil(y / 2),
        //                 right: Math.ceil(x / 2),
        //                 background: {r:0, g:0, b:0, alpha:0}
        //             }]
        //         }
        //     }]
        // }))
        .use(msIf(prod, sharp({
            // Compress images
            src: '**/*',
            ...compressed
        })))
};
