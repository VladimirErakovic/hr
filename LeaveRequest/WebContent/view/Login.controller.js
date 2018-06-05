sap.ui.define([
     	"sap/ui/core/mvc/Controller",
     	"sap/m/MessageBox",
     	"sap/m/MessageToast",
     	"jquery.sap.storage",
     	"jquery.sap.resources"
      ], function (Controller, MessageBox, MessageToast, jQuery) {
      "use strict";
      
    var oJQueryStorageLocal, oBundle, that, loginUserId, loginPassword;
      
  	return Controller.extend("mkbs.leaverequest.view.Login", {	

  		
		onInit: function () {
			
			that = this;
			
			loginUserId = null;
			loginPassword = null;
			
		    	oJQueryStorageLocal = jQuery.sap.storage(jQuery.sap.storage.Type.local); 
		    	loginUserId = oJQueryStorageLocal.get("login_username");
		    	loginPassword = oJQueryStorageLocal.get("login_password");

	        	oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
	 
		},
		
		onUserSubmit : function(oEvent) {
			  this.getView().byId("loginButton").firePress();
		},
		
		onPasswordSubmit : function(oEvent) {
			  this.getView().byId("loginButton").firePress();
		},
		
		btnLogin: function(event) {
			
			var serviceString;
			var param1 = oBundle.getText("GatewayUsername");
			var param2 = oBundle.getText("GatewayPassword");
			
			var urlLogin = "proxy/https/***/sap/opu/odata/SAP/ZHR_ABSENCE_LOGIN_SRV/";
			var oUserModel = new sap.ui.model.odata.ODataModel(urlLogin, true, param1, param2); 
			
			var oView = this.getView();
			var userId = oView.byId("userID").valueOf().getValue();
			var password = oView.byId("passID").valueOf().getValue();
			
			if(userId == "") {
				// Niste uneli korisničko ime - e-mail.
				MessageToast.show(oBundle.getText("NoUserMsg"));
				return;
			}
			if(password == "") {
				//Niste uneli lozinku.
				MessageToast.show(oBundle.getText("NoPassMsg"));
				return;
			}
			if(isNaN(userId)){
				   // The string does not have numbers in it.
				serviceString = "/EtLoginSet(ImUser='" + userId + "',ImPernr='',ImPass='" + password + "')";
			} else {
				   // The string has a number, do whatever logic you need here.
				serviceString = "/EtLoginSet(ImUser='',ImPernr='" + userId + "',ImPass='" + password + "')";
			}
			
			
			oUserModel.read(serviceString, null, null, false, 
					function(oResponse) { // onSuccess function
		
					    var error = oResponse.ExError;
					    var userPernr = oResponse.ExPernr;
					    var mngrPernr = oResponse.ExMngpr;
					    var mngrName = oResponse.ExMngnm;
					    var sysUsername = oResponse.ExUname;
					    var firstNameLastName = oResponse.ExSname;
					    
					    if(error === "") {	
					    	
						    oJQueryStorageLocal.put("login_username", userId);
						    oJQueryStorageLocal.put("login_password", password);
					    	
						    oJQueryStorageLocal.put("manager_pernr", mngrPernr);
						    oJQueryStorageLocal.put("manager_name", mngrName);
						    oJQueryStorageLocal.put("user_pernr", userPernr);
						    oJQueryStorageLocal.put("sys_uname", sysUsername);
						    oJQueryStorageLocal.put("real_username", firstNameLastName);
					    	
							that.getOwnerComponent().getRouter().navTo("Main");  
							
					    } else {
		
						    sap.m.MessageBox.show(
						    		oBundle.getText(error), {
							          icon: MessageBox.Icon.ERROR,
							          title: oBundle.getText("Error"),
							          actions: MessageBox.Action.OK
							      }
							);			
					    }
		
					}, 		
					function(oError) { // onError function
		
					    sap.m.MessageBox.show(
					    		oBundle.getText("CheckInternetConnection"), {
						          icon: MessageBox.Icon.ERROR,
						          title: oBundle.getText("ServerErrorMsg"),
						          actions: MessageBox.Action.OK
						      }
						);
			
					}
				);
						
		},

		onAfterRendering: function() {
			
		    if (loginUserId != null && loginPassword != null) {
		    	this.getOwnerComponent().getRouter().navTo("Main", null, true);
		    } 
	
		}

  		
  	})

});
