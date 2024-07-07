// get parameters

function get_parameters() {

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	let paramsObj = {};

	for (let param of urlParams.entries()) {
		paramsObj[param[0]] = param[1];
	}

	return paramsObj;

}

// http request

function http_request(type, url, parameters) {
	return $.ajax({
		url: url,
		type: type,
		data: parameters,
		dataType: "json"
	});
}

function http_request_error_handling(status, message) {
	switch (status) {
		case (400 || 404 || 500):
			console.log("error: " + status);
			console.log("message: " + message);
			notification({
				error: true,
				body: message
			});
			break;
		case 401:
			localStorage.removeItem('session_token');
			window.location.href = "signin.html";
			break;
	}
}

function api_request(method, endpoint, json_body, callback) {

	http_request(method, "https://api.docufast.fabulous-code.com/" + endpoint, json_body)
		.done(function (response) {
			callback(response);
		})
		.fail(function (jqXHR) {
			http_request_error_handling(jqXHR.status, jqXHR.responseJSON.message);
		});

}

function api_file_upload(input_id, callback) {

	var fileInput = document.getElementById(input_id);

	var file = fileInput.files[0];

	var formData = new FormData();

	formData.append('file', file, file.name);

	formData.append('filename', file.name);

	$.ajax({
		url: 'https://api.docufast.fabulous-code.com/files',
		type: 'POST',
		headers: {
			'Authorization': 'Bearer XXX'
		},
		data: formData,
		processData: false,
		contentType: false,
		success: function (response) {
			callback(response.file_url);
		},
		error: function (jqXHR) {
			http_request_error_handling(jqXHR.status, jqXHR.responseJSON.message);
		}
	});

}

// session token

function session_token_get() {

	if (get_parameters().session_token) {
		localStorage.setItem('session_token', get_parameters().session_token);
		return get_parameters().session_token;
	}
	else {
		return localStorage.getItem('session_token');
	}

}

function session_token_check() {
	if (session_token_get()) {
		api_request("GET", "session", {
			session_token: localStorage.getItem("session_token"),
		}, (response) => {
			window.location.href = "guides.html";
		});
	}
}

function session_token_delete() {
	localStorage.removeItem('session_token');
	window.location.href = "signin.html";
}

// notification

function notification(parameters) {

	const {
		body,
		button_text,
		error,
		redirect_url
	} = parameters;

	$('body').append(`<div id="notification" class="swal2-container swal2-center swal2-backdrop-show" style="overflow-y: auto;">
        <div aria-labelledby="swal2-title" aria-describedby="swal2-html-container" class="swal2-popup swal2-modal swal2-icon-error swal2-show" tabindex="-1" role="dialog" aria-live="assertive" aria-modal="true" style="display: grid;">
            ` + (error ? '<div class="swal2-icon swal2-error swal2-icon-show" style="display: flex;"><span class="swal2-x-mark"><span class="swal2-x-mark-line-left"></span><span class="swal2-x-mark-line-right"></span></div>' : '<div class="swal2-icon swal2-success swal2-icon-show" style="display: flex;"><div class="swal2-success-circular-line-left"></div><span class="swal2-success-line-tip"></span><span class="swal2-success-line-long"></span><div class="swal2-success-ring"></div><div class="swal2-success-fix"></div><div class="swal2-success-circular-line-right"></div></div>') + `
            <div class="swal2-html-container" id="swal2-html-container" style="display: block;">` + body + `</div>
            <div class="swal2-actions" style="display: flex;">
                <div class="swal2-loader"></div>
                ` + (redirect_url ? `<a href="` + redirect_url + `" onclick="$('#notification').remove();" class="swal2-confirm btn fw-bold btn-light-primary" aria-label="" style="display: inline-block;">` + (button_text ? button_text : 'Schließen') + `</a>` : `<button type="button" onclick="$('#notification').remove();" class="swal2-confirm btn fw-bold btn-light-primary" aria-label="" style="display: inline-block;">` + (button_text ? button_text : 'Schließen') + `</button>`) + `
            </div>
        </div>
    </div>`);

}