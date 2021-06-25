$(document).ready(function() {
  const showModal = (target = '#staticModal') => {
    $(target).modal('show');
  }
  
  const closeModal = (target = '#staticModal') => {
    $(target).modal('hide');
  }
  
  $('.container').on('click','.btn-close_modal', (e) => {
    closeModal();
  });
  
  const setupModal = (modal, label, background, body) => {
    $(modal ? `${modal}Label` : `#staticModalLabel`).html(label);
    $('.modal-header').attr('class', background ? `modal-header ${background}` : 'modal-header bg-primary');
    $('.modal-body').html(body ? body : $('.modal-body').html());
  }
  
  const showModalLogin = () => {
    setupModal(null,'Welcome back!',null,`
      <form action="" method="post" id="form-login_user" autocomplete="off">
        <div class="alert alert-danger mb-3 alert-error_message d-none" role="alert"></div>
        
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fa fa-fw fa-envelope"></i>
            </span>
          </div>
          <input type="text" class="form-control" placeholder="Email" name="email" />
        </div>
        
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fa fa-fw fa-lock"></i>
            </span>
          </div>
          <input type="password" class="form-control" placeholder="Password" name="password" />
        </div>
        
        <div class="text-right">
          <button type="submit" class="btn btn-primary">
            <i class="fa fa-fw fa-paper-plane"></i>
            login
          </button>
        </div>
        
        <!-- <div class="text-center mt-3">
          <p>Don't have an account yet? <a href="#" class="btn-register_user">register here!</a></p>
        </div> -->
      </form>
    `);
    $('.btn-close_modal').addClass('d-none');
    showModal();
  }
  
  $('.container').on('click','.btn-login_user',() => {
    showModalLogin();
  });
  
  $('.container').on('click','.btn-register_user',() => {
    setupModal(null,'Create your account!',null,`
      <form action="" method="post" id="form-register_user" autocomplete="off">
        <div class="alert alert-danger mb-3 alert-error_message d-none" role="alert"></div>
        
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fa fa-fw fa-envelope"></i>
            </span>
          </div>
          <input type="text" class="form-control" placeholder="Email" name="email" />
        </div>
        
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fa fa-fw fa-lock"></i>
            </span>
          </div>
          <input type="password" class="form-control" placeholder="Password" name="password" />
        </div>
        
        <div class="text-right">
          <button type="submit" class="btn btn-primary">
            <i class="fa fa-fw fa-paper-plane"></i>
            register
          </button>
        </div>
        
        <div class="text-center mt-3">
          <p>Already have an account? <a href="#" class="btn-login_user">login here!</a></p>
        </div>
      </form>
    `);
    $('.btn-close_modal').addClass('d-none');
    showModal();
  });
  
  $('.container').on('click','.btn-create-request',() => {
    setupModal(null,'Request a Tutorial',null,`
      <form action="" method="post" id="form-create-request" autocomplete="off">
        <div class="alert alert-danger mb-3 alert-error_message d-none" role="alert"></div>
        
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fa fa-fw fa-edit"></i>
            </span>
          </div>
          <input type="text" class="form-control" placeholder="Request Title" name="text" />
        </div>
        
        <div class="text-right mb-3">
          <button type="submit" class="btn btn-outline-primary">
            <i class="fa fa-fw fa-paper-plane"></i>
            send
          </button>
        </div>
      </form>
    `);
    $('.btn-close_modal').removeClass('d-none');
    showModal();
  });
  
  // auth listener
  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      $('.auth-open').addClass('d-none');
      closeModal();
    } else {
      $('.auth-open').removeClass('d-none');
      showModalLogin();
    }
  });
  
  // register
  $('.container').on('submit','#form-register_user',(e) => {
    e.preventDefault();
    const email    = $('[name="email"]').val();
    const password = $('[name="password"]').val();
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(user => {
        console.log('registered', user);
        $('.auth-open').addClass('d-none');
        closeModal();
      })
      .catch(err => {
        $('.alert-error_message').text(err.message).removeClass('d-none');
      });
  }); 
  
  // login
  $('.container').on('submit','#form-login_user',(e) => {
    e.preventDefault();
    const email    = $(`[name="email"]`).val();
    const password = $(`[name="password"]`).val();
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(user => {
        $('.auth-open').addClass('d-none');
        closeModal();
      })
      .catch(err => {
        $('.alert-error_message').text(err.message).removeClass('d-none');
      });
  });
  
  // logout
  $('.container').on('click','.btn-logout_user',() => {
    firebase.auth().signOut()
      .then(() => {
        console.log('logged out');
      });
  });
  
  // adding a request
  $('.container').on('submit','#form-create-request',(e) => {
    e.preventDefault();
    
    $(`[type='submit']`).parent().html(`
      <button class="btn btn-primary" type="button" disabled>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        Loading...
      </button>
    `);
    $('.btn-close_modal').addClass('d-none');
    
    const addRequest = firebase.functions().httpsCallable('addRequest');
    
    addRequest({ 
      text: $('[name="text"]').val()
    })
      .then(() => {
        $('.alert-error_message').addClass('d-none');
        closeModal();
      })
      .catch(err => {
        if(err.code === 'internal') {
          $('.alert-error_message').addClass('d-none');
          closeModal();
        } else {
          $('.alert-error_message').text(err.message).removeClass('d-none');
        }
      });
  });
  
  let app = new Vue({
    el: '#app',
    data: {
      requests: []
    },
    methods: {
      upvoteRequest(id) {
        const upvote = firebase.functions().httpsCallable('upvote');
        upvote({ id })
        .catch(error => {
          setupModal(null,'sorry looks like an error occurred','bg-danger',`
            <p class="pb-2">${error.message}</p>
          `);
          $('.btn-close_modal').removeClass('d-none');
          showModal();
        });
      }
    },
    mounted() {
      const ref = firebase.firestore().collection('requests').orderBy('upvotes', 'desc');
      ref.onSnapshot(snapshot => {
        let requests = [];
        snapshot.forEach(doc => {
          requests.push({ ...doc.data(), id: doc.id });
        });
        
        this.requests = requests;
      });
    }
  });
});

/* +================================================++================================================++================================================++================================================+ */
