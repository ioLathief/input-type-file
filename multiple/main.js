"use strict"

let selectors = {
    input: $('input.siin'),
    drop_container: $('input.siin + .siin .__container'),
    images: $('input.siin + .siin .__images'),
    images_overlay: $('input.siin + .siin .__images .__overlay'),
    image_list: $('input.siin + .siin .__images .__image-list'),
    image_count_text: $('input.siin + .siin .__images .__text'),
    add_image: $('input.siin + .siin .__images .__add'),
    select: $('input.siin + .siin .__select'),
    select_text: $('input.siin + .siin .__select > span'),
}

let siin = {
    _default_select_text: selectors.select_text.text(),
    _dragover_state_active: false,
    _image_loaded: false,
    _image_element: selectors.image_list.children('.__image').remove().clone(),
    updateImageCountText() {
        selectors.image_count_text.text(`${siin.image.count} images selected`)
    },
    image: {
        count: 0,
        attr: {
            id: 'data-file-id'
        },
        add(imageURL, imageName) {
            siin.image.count++
            let t =siin._image_element.clone().appendTo(selectors.image_list).attr(siin.image.attr.id, siin.image.count-1).on('click', removeImageElement)
            t.children('.__bg').css('background-image',`url("${imageURL}")`)
        },
        load(imageList) {
            imageList.forEach(image => { siin.image.add(image.imageURL, image.imageName) })
            if (!this._image_loaded) {
                this._image_loaded = true

                selectors.select.removeClass('is-active')
                selectors.images.addClass('is-active')
            }
        },
        getImageObject(fileList, callback) {
            let image_list = []
            for (let index = 0; index < fileList.length; index++) {
                const file = fileList[index]
                image_list[index] = {imageURL: URL.createObjectURL(file), imageName: file.name}
                if (image_list.length === fileList.length && !image_list.includes(undefined))
                    callback(image_list)
            }

        },
        removeEl(el) {
            siin.image.count--
            let jel = $(el)
            jel.remove()
            let id = parseInt(jel.attr(siin.image.attr.id))
            for (let index = id + 1; index < siin.image.count + 1; index++) {
                let the_element = selectors.image_list.find(`[${siin.image.attr.id}=${index}]`)
                the_element.attr(siin.image.attr.id, index - 1)
            }
        }
    },
    input: {
        files: selectors.input[0].files,
        addFile(new_file_list) {
            let merged = mergeFileList(siin.input.files, new_file_list)
            siin.input.files = merged
        },
        removeFile(id) {
            let fileList = removeFileListElement(siin.input.files, id)
            siin.input.files = fileList
        }
    },

    state_dragover: {
        activate() {
            if (!siin._dragover_state_active) {
                if (siin._image_loaded)
                    selectors.images_overlay.addClass('is-active')
                siin._dragover_state_active = true
                selectors.select_text.text('Drop Now')
            }
        },
        diactivate() {
            if (siin._dragover_state_active) {
                if (siin._image_loaded)
                    selectors.images_overlay.removeClass('is-active')
                siin._dragover_state_active = false
                selectors.select_text.text(siin._default_select_text)
            }
        }
    }
}



//***************************************** Utils

/*
* File selector dialog
* @param {string} contentType content type for the select input type file element e.g. "image/*"
* @param {boolean} multiple is multiple file select true or false
* */
function selectFile(contentType, multiple) { // await selectFile
    return new Promise(resolve => {
        let input = document.createElement('input')
        input.type = 'file'
        input.multiple = multiple
        input.accept = contentType

        input.onchange = _ => resolve(input.files)

        input.click()
    })
}

function removeFileListElement(fileList, index) {
    let list = new DataTransfer()
    for (let i = 0; i < fileList.length; i++) {
        if (i == index)
            continue
        list.items.add(fileList[i])
    }
    return list.files
}

function mergeFileList(first, second) {
    let list = new DataTransfer()
    for (let i = 0; i < first.length; i++)
        list.items.add(first[i])

    for (let i = 0; i < second.length; i++)
        list.items.add(second[i])

    return list.files
}



//***************************************** Add and Remove Image

function addImageHandler(newFileList) {
    siin.input.addFile(newFileList)

    siin.image.getImageObject(newFileList, function (new_image_list) {
        siin.image.load(new_image_list)
        siin.updateImageCountText()
    })
}

function removeImageHandler(image_element) {
    let id = parseInt($(image_element).attr(siin.image.attr.id))
    siin.input.removeFile(id)
    siin.image.removeEl(image_element)
    siin.updateImageCountText()
}


//***************************************** Handle Clicks

function removeImageElement(e) {//remove image handler
    removeImageHandler(this)
}

selectors.add_image.on('click', async e => {
    let new_files = await selectFile('image/*', true)
    addImageHandler(new_files)
})

selectors.select.on('click', async e => {
    let new_files = await selectFile('image/*', true)
    addImageHandler(new_files)
})


//***************************************** Handle Drop

selectors.select.on('drop', e => {
    e.preventDefault()
    e.stopPropagation()
    addImageHandler(e.originalEvent.dataTransfer.files)

    siin.state_dragover.diactivate()
})

selectors.images.on('drop', e => {
    e.preventDefault()
    e.stopPropagation()
    addImageHandler(e.originalEvent.dataTransfer.files)

    siin.state_dragover.diactivate()
})

//***************************************** Handle Dragover

selectors.select.on('dragover', e => {
    e.preventDefault()
    e.stopPropagation()
    siin.state_dragover.activate()
})

selectors.images.on('dragover', e => {
    e.preventDefault()
    e.stopPropagation()
    siin.state_dragover.activate()
})

//prevent window not to load the image
$(window).on('dragover', e => {
    e.preventDefault()
    siin.state_dragover.diactivate()
    return false
})

$(window).on('drop', e => {
    e.preventDefault()
    siin.state_dragover.diactivate()
    return false
})

