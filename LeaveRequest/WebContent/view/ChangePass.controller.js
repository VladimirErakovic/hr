sap.ui.define([
     	"sap/ui/core/mvc/Controller",
     	"sap/m/MessageBox",
     	"sap/m/MessageToast",
     	"jquery.sap.storage",
     	"jquery.sap.resources"
      ], function (Controller, MessageBox, MessageToast, jQuery) {
      "use strict";
      
    var oJQueryStorage, userPernr, oBundle, that;
      
  	return Controller.extend("mkbs.leaverequest.view.ChangePass", {	

  		
		onInit: function () {
			
			that = this;
			
			oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			userPernr = oJQueryStorage.get("user_pernr");
			
			oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
			
		},
		
		btnLoginCP: function() {
			
			var param1 = oBundle.getText("GatewayUsername");
			var param2 = oBundle.getText("GatewayPassword");
			
			var oView = this.getView();
			var newPass = oView.byId("changePassID").valueOf().getValue();
			
			var urlChangePass = "proxy/https/***/sap/opu/odata/SAP/ZHR_ABSENCE_LOGIN_SRV/";
			var oChangePassModel = new sap.ui.model.odata.ODataModel(urlChangePass, true, param1, param2);
			
			oChangePassModel.read("/ChangePassSet(ImPernr='" + userPernr + "',ImPassw='" + newPass + "')", null, null, false, 
					function(oResponse) { // onSuccess function
		
					    var message = oResponse.ExMsg;
					    
					    if(message === "OK") {	
					    	
						    sap.m.MessageBox.show(
						    		oBundle.getText(oBundle.getText("ChangePassLoginAgain")), {
							          icon: MessageBox.Icon.SUCCESS,
							          title: oBundle.getText("ChangePassSuccess"),
							          actions: MessageBox.Action.OK,
							          onClose: function(oAction) { 
							        	  
							  			oJQueryStorage.remove("login_username");
										oJQueryStorage.remove("login_password");
										oJQueryStorage.remove("user_pernr");
										oJQueryStorage.remove("manager_pernr");
										oJQueryStorage.remove("sys_uname");
										oJQueryStorage.remove("manager_name");

										that.getOwnerComponent().getRouter().navTo("Login", null, true);
							          }
							      }
							);
					    	
					    } else {
		
						    sap.m.MessageBox.show(
						    		oBundle.getText(message), {
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
		
		navigationBack: function() {
			
			this.getOwnerComponent().getRouter().navTo("Main" ,{});
			
		}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ChangePass
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ChangePass
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ChangePass
*/
//	onExit: function() {
//
//	}
  		
  	})

});
