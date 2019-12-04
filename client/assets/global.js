// Helper javascript
// Written by Filipe Laborde, 2019
// fil@rezox.com
//
// MIT license, use as you wish!

const PREVIEW_SIZE_MAX = 50000000;
const PREVIEW_DEFAULT = "/assets/pics/_profile.png";

// take INPUTs in a form, and POST them (inc media) to server
function formSend( selectorCriteria, apiURL ){
    // gather the INPUT data, append it into a form and POST it!
    const formData = new FormData();
    formData.append('session', localStorage.session);
    
    const itemData = document.querySelectorAll( selectorCriteria );
    for( item of itemData ){
        // append input-field name + value; *except* for files where we attach first files object
        console.log( ` - appending (${item.type}): ${item.name}:`, (item.type=='file' ? item.files[0] : item.value) );
        formData.append(item.name, (item.type=='file' ? item.files[0] : item.value) );
    }
    
    let postData = { 
        method: 'POST', 
        body: formData,
        headers: new Headers()
    }
    // we get fetch promise, but before returning decode json response
    return fetch(apiURL, postData).then( response => response.json() );
}

// clear the form
function formClear( selectorCriteria ){
    //document.querySelector( selectorCriteria ).reset();
    const itemData = document.querySelectorAll( selectorCriteria );
    for( item of itemData ){
        console.log( ` - clearing (${item.type}): ${item.name}:`, (item.type=='file' ? item.files[0] : item.value) );
        item.value = '';
    }
}

// read the file selected in an INPUT, and display it
function inputFilePreview( fileInput, previewImage ){
    const preview = document.querySelector(previewImage);
    const file    = document.querySelector(fileInput).files[0];
    const reader  = new FileReader();
   
    if( file && file.type.indexOf('image/')>-1 && file.size<PREVIEW_SIZE_MAX )
        reader.readAsDataURL(file);
    else
        preview.src = PREVIEW_DEFAULT;
        
    // if we managed to read data, set preview to it
    reader.onloadend = ()=> { preview.src = reader.result; }
}