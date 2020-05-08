let selectors = {
	input : $('input.siin'),
	drop_container : $('input.siin + .siin .__container'),
	image : $('input.siin + .siin .__container .__image'),
	image_overlay : $('input.siin + .siin .__container .__image .__overlay'),
	image_bg : $('input.siin + .siin .__container .__image .__bg'),
	select : $('input.siin + .siin .__container .__select'),
	select_text : $('input.siin + .siin .__container .__select > span'),
	image_name : $('input.siin + .siin .__image-name span'),
	remove : $('input.siin + .siin .__remove'),
}

let siin = {
	_default_image_text : selectors.image_name.text(),
	_default_select_text: selectors.select_text.text(),
	_dragover_state_active : false,
	_image_loaded: false,
	load_image(fileURL, fileName){
		this._image_loaded = true
		selectors.image_bg.css('background-image', `url('${fileURL}')`)

		selectors.select.removeClass('is-active')
		selectors.image.addClass('is-active')	

		selectors.image_name.text(fileName)

		selectors.remove.addClass('is-active')
	},
	unload_image(){
		this._image_loaded = false
		selectors.image_bg.css('background-image', '')

		selectors.select.addClass('is-active')
		selectors.image.removeClass('is-active')	

		selectors.image_name.text(this._default_image_text)

		selectors.remove.removeClass('is-active')
	},
	state_dragover : {
		activate(){
			if (!siin._dragover_state_active){
				if (siin._image_loaded){
					selectors.image_overlay.addClass('is-active')
				}
				siin._dragover_state_active = true
				selectors.select_text.text('Drop Now')
			}
		},
		diactivate(){
			if (siin._dragover_state_active){
				if (siin._image_loaded)
					selectors.image_overlay.removeClass('is-active')
				siin._dragover_state_active = false
				selectors.select_text.text(siin._default_select_text)
			}
		}
	}
}


selectors.select.on('click', function(e){
	selectors.input.trigger('click')
})

selectors.input.on('change', function(e){
	let input = this

	let reader = new FileReader()
	reader.onload = function(e){
		siin.load_image(e.target.result, input.files[0].name)
	}
	reader.readAsDataURL(this.files[0])	
})

//remove click handle
selectors.remove.on('click', function(e){
	selectors.input.val('')
	siin.unload_image()
})


//drop 
selectors.drop_container.on('drop', function(e){
	e.preventDefault()
	e.stopPropagation()
	selectors.input[0].files = e.originalEvent.dataTransfer.files
	file = e.originalEvent.dataTransfer.files[0]

	let reader = new FileReader()
	reader.onload = function(e){
		siin.load_image(e.target.result, file.name)
	}
	reader.readAsDataURL(file)

	siin.state_dragover.diactivate()
})

selectors.drop_container.on('dragover', function(e){
	e.preventDefault()
	e.stopPropagation()
	siin.state_dragover.activate()
})


//prevent window not to load the image
$(window).on('dragover', function(e){
	e.preventDefault()
	siin.state_dragover.diactivate()
	return false
})

$(window).on('drop', function(e){
	e.preventDefault()
	siin.state_dragover.diactivate()
	return false
})

