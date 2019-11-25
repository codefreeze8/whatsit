const PREVIEW_SIZE_MAX = 50000000;
const PREVIEW_DEFAULT = "/assets/pics/_profile.png";

function toggleRegister(){
    if( $('#registerForm').css('display')=='none' ){
        $('#registerForm').show();
        $('#loginForm').hide();
    } else {
        $('#registerForm').hide();
        $('#loginForm').show();
    }
}

// preview the picture taken/attached
function formInputFilePreview(){
    // jQuery needs get(0) to expose 'document.querySelector' element
    const preview = $('#pic-preview').get(0);
    const file    = $('#pic').get(0).files[0];
    const reader  = new FileReader();
   
    if( file && file.type.indexOf('image/')>-1 && file.size<PREVIEW_SIZE_MAX )
        reader.readAsDataURL(file);
    else
        preview.src = PREVIEW_DEFAULT;
        
    // if we managed to read data, set preview to it
    reader.onloadend = ()=> { preview.src = reader.result; }
}

async function formLogin( event ){
    event.preventDefault();

    const response = await $.post( '/api/login', 
        { email: $('#login-email').val(), 
        password: $('#login-password').val() } );
    
    if( response.status && response.userData.session){
        console.log( `~ setting the session: ${response.userData.session}`)
        localStorage.session = response.userData.session;
        location.href = '/';

    } else {
        // show the error for 5s
        $('#error').html( response.error ).removeClass('d-none');
        setTimeout( ()=>{ $('#error').addClass('d-none');}, 5000 );
    }
}


$(document).ready(function(){
    // on load show login page
    toggleRegister();
    // set picture default
    $('#pic-preview').attr('src', PREVIEW_DEFAULT);

    /* noticed gentelella had this 'smart-wizard', googled to figure out use */
    async function wizardStepChange(obj, context){
        console.log( `stepChange step from: ${context.fromStep} toi: ${context.toStep}`, context ); //validateSteps( context );
        if( context.toStep==3 || !context.toStep ){
            // gather the INPUT data, append it into a form and submit
            const formData = new FormData();
            const regData = document.querySelectorAll('#regData INPUT');
            for( item of regData ){
                // append input-field name + value; *except* for files where we attach first files object
                console.log( ` - appending (${item.type}): ${item.id}:`, (item.type=='file' ? item.files[0] : item.value) );
                formData.append(item.id, (item.type=='file' ? item.files[0] : item.value) );
            }
            
            // gather and send registration to the server
            const response = await $.ajax({
                type: "POST",
                url: '/api/register',
                data: formData,
                processData: false,
                contentType: false
            });
            console.log( ` .. server response:`, response );
            // only show message for matching response
            $('.reg-status').removeClass('d-none').addClass('d-none');
            $(`#status${response.status}`).removeClass('d-none');
            // worked so go to login page
            if( response.status==1 ){
                setTimeout( ()=>{ toggleRegister(); }, 5000 );
            } else if( response.status==0 ){
                $('#reg-error').text( response.error );
            }
        }
            
        return true;
    }
// Modified smartwizard for button order:
// node_modules/gentelella/vendors/jQuery-Smart-Wizard/js/jquery.smartWizard.js:54
//     elmActionBar.append($this.buttons.previous)
//                 .append($this.buttons.next)
//                 .append($this.buttons.finish);
  $('#wizard').smartWizard({
    selected: 0,  // Selected Step, 0 = first step   
    keyNavigation: true, // Enable/Disable key navigation(left and right keys are used if enabled)
    enableFinishButton: false, // makes finish button enabled always
	hideButtonsOnDisabled: true, // when the previous/next/finish buttons are disabled, hide them instead
    labelNext:`<a href='#wizard' class='btn btn-lg btn-success'><i class="fas fa-arrow-right"></i></a>`, // label for Next button
    labelPrevious:`<a href='#wizard' class='btn btn-lg btn-secondary'><i class="fas fa-arrow-left"></i></a>`, // label for Previous button
    labelFinish:`<a href='#wizard' class='btn btn-primary'>Done</a>`,  // label for Finish button        
    noForwardJumping:false,
    onLeaveStep: wizardStepChange, // triggers when leaving a step
    onFinish: wizardStepChange  // triggers when Finish button is clicked  
    });
    // added a cancel button to the wizard bar
    $('.actionBar').prepend(`<button onClick='toggleRegister()' class='btn btn-sm btn-ghost-secondary text-secondary float-left'>Cancel</button>`)

});