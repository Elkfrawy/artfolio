(function ($) {
  const submitComment = $('#commentForm');
  const errorMessages = $('#error-messages');

  // errorMessages.hide();
  submitComment.submit(function (event) {
    event.preventDefault();
    errorMessages.empty();
    const hasError = false;

    // For each field do validation
    const comment = $('#comment').val();
    if (comment === undefined || comment === '' || comment === null) {
      errorMessages.append('<li>Please provide a comment text</li>');
      hasError = true;
    } else {
      const artworkId = $('#artworkId').val();
      let requestConfig = {
        method: 'POST',
        url: submitComment.attr('action'),
        contentType: 'application/json',
        data: JSON.stringify({
          comment,
          artworkId,
        }),
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        if (responseMessage.error) {
          errorMessages.show();
          errorMessages.text(responseMessage.error);
        } else {
          const { _id, comment, userId, userName } = responseMessage.createdComment;
          const artworkId = responseMessage.artworkId;
          const commentsContainer = $('#commentsContainer');
          commentsContainer.append(
            $(
              `
        <div class="media my-4">
          <img class="d-flex mr-3 rounded-circle avatar-lg" src="/pictures/user/${userId}" alt="">
          <div class="media-body">
            <h5 class="mt-0"> <a href="/users/portfolio/${userId}">${userName}</a></h5>
            ${comment}
            <br>
            <a href="/artworks/${artworkId}/comments/${_id}" class="deleteComment btn btn-danger btn-sm my-2">Delete</a>
          </div>
        </div>
        `
            )
          );
          $('#comment').val('');
          registerDeleteEvent();
        }
      });
    }
  });

  function registerDeleteEvent() {
    $('.deleteComment').each(function () {
      const deleteBut = $(this);
      const deleteLink = deleteBut.attr('href');
      deleteBut.click(function () {
        let requestConfig = {
          type: 'DELETE',
          url: deleteLink,
        };

        $.ajax(requestConfig).then(function (responseMessage) {
          if (responseMessage.error) {
            errorMessages.show();
            errorMessages.text(responseMessage.error);
          } else {
            errorMessages.hide();
            deleteBut.parent().parent().remove();
          }
        });

        return false;
      });
    });
  }
  registerDeleteEvent();

  // Validate Register form
  // .validate will use the validations in the HTML itself like required, minLength...
  // and in addition it will validate the custom validations below
  $('#register').validate({
    rules: {
      firstName: {
        letterswithbasicpunc: true,
      },
      lastName: {
        letterswithbasicpunc: true,
      },
      password: {
        minlength: 8,
      },
      passwordConfirm: {
        minlength: 8,
        equalTo: '#password',
      },
    },
    // All rules has build in message, but you can customize these messages with the following section
    messages: {
      passwordConfirm: {
        equalTo: "Password and its confirmation don't match",
      },
    },
  });

  // If we don't have custom validations we can use the following line to use only the validations on the HTML elements
  $('#login').validate();

  $('#form-profile-edit').validate({
    rules: {
      firstName: {
        required: true,
        letterswithbasicpunc: true,
      },
      lastName: {
        required: true,
        letterswithbasicpunc: true,
      },

      'address[city]': {
        lettersonly: true,
      },
      'address[state]': {
        lettersonly: true,
        stateUS: {
          depends: function (element) {
            const country = $('#address-country')[0];
            return country.value === 'United States';
          },
        },
      },
      'address[zipCode]': {
        zipcodeUS: {
          depends: function (element) {
            const country = $('#address-country')[0];
            return country.value === 'United States';
          },
        },
      },

      birthday: { pastDateOnly: true },
      websiteUrl: {
        url: true,
      },

      'socialMedia[instagram]': {
        url: true,
      },
      'socialMedia[twitter]': {
        url: true,
      },
      'socialMedia[facebook]': {
        url: true,
      },
      'socialMedia[linkedIn]': {
        url: true,
      },
    },
  });

  $('#form-password-edit').validate({
    rules: {
      currentPassword: {
        minlength: 8,
      },

      newPassword: {
        minlength: 8,
      },

      confirmPassword: {
        minlength: 8,
        equalTo: '#newPassword',
      },
    },
  });

  $().ready(function () {
    $('#createForm').validate({
      rules: {
        title: 'required',
        description: 'required',
        category: {
          required: true,
          letterswithbasicpunc: true,
        },
        createDate: {
          required: true,
          pastDateOnly: true,
        },
      },
      messages: {
        title: 'Please enter a title',
        description: 'Please provide a description',
        category: {
          required: 'Please enter a category',
          letterswithbasicpunc: 'Please enter a letters only category',
        },
        createDate: {
          required: 'Please select the artwork creation date',
        },
      },
    });
  });

  $().ready(function () {
    $('#editForm').validate({
      rules: {
        title: 'required',
        description: 'required',
        category: {
          required: true,
          letterswithbasicpunc: true,
        },
        createDate: {
          required: true,
          pastDateOnly: true,
        },
      },
      messages: {
        title: 'Please enter a title',
        description: 'Please provide a description',
        category: {
          required: 'Please enter a category',
          letterswithbasicpunc: 'Please enter a letters only category',
        },
        createDate: {
          required: 'Please select the artwork creation date',
        },
      },
    });
  });

  jQuery.validator.addMethod(
    'pastDateOnly',
    function (value, element) {
      const CreateDate = new Date(value);
      const nowDate = new Date();
      return this.optional(element) || CreateDate <= nowDate;
    },
    'Artwork creation date must be in the past.'
  );
})(jQuery);
