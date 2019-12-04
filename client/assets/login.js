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
function regFormFilePreview(){
    inputFilePreview('#pic','#pic-preview');
}

function regFormClear( event ){
    event.preventDefault();
    formClear('#regData INPUT');
    $('#pic-preview').attr('src','assets/pics/_profile.png');
    toggleRegister();
}

async function formLogin( event='', response='' ){
    if( event ) event.preventDefault();

    // pass in already complete response for registration
    if( !response ){
        response = await formSend( '#loginData INPUT', '/api/login' );
        console.log( `[login] response:`, response );
    }

    if( response.status && response.user.session){
        console.log( `~ setting the session: ${response.user.session}`)
        localStorage.session = response.user.session;
        localStorage.room = response.user.room;
        location.href = '/';

    } else {
        // show the error for 5s
        console.log( `[login] INVALID login, error ${response.error}` );
        $('#error').html( response.error ).removeClass('d-none');
        $('#login-password').val('').focus();
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

            const response = await formSend('#regData INPUT','/api/register');
            console.log( ` .. server response:`, response );
            // if login ok, it will redirect, the response = user-login result:
            formLogin( null, response );

            // login FAILED, so show error...
            // toggle d-none class on for all of the reg-status elements; then remove from the individual status0/1
            $('.reg-status').removeClass('d-none').addClass('d-none');
            $(`#status${response.status}`).removeClass('d-none');
            $('#reg-error').text( response.error );
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
        $('.actionBar').prepend(`<button onClick='regFormClear(event)' class='btn btn-sm btn-ghost-secondary text-secondary float-left'>Cancel</button>`)

});