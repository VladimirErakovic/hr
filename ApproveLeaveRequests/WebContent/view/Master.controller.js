sap.ui.define([
    	"sap/ui/core/mvc/Controller",
    	"sap/m/MessageBox",
    	"sap/ui/core/routing/History",
    	"mkbs/approveleaverequests/utils/Formatter",
    	"sap/m/MessageToast",
    	"jquery.sap.resources",
    	"jquery.sap.storage"
       ], function (Controller, MessageBox, History, Formatter, MessageToast, jQuery) {
       "use strict";
       
       var that, oJQueryStorage, userPernr, user, pass;
       
       return Controller.extend("mkbs.approveleaverequests.view.Master", {


			onInit: function() {
				
				that = this;
				
		        var oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
				
				user = oBundle.getText("GatewayUsername");
				pass = oBundle.getText("GatewayPassword");
				
				userPernr = null;
				var realUserName = null;
							
				oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);					
				userPernr = oJQueryStorage.get("alr_user_pernr");
				realUserName = oJQueryStorage.get("alr_real_username");
				
				this.getView().byId("pageTitleUserName")
					.setText(oBundle.getText("MasterPageTitle") + " " + realUserName);
											
				var oView = this.getView().byId("requestList");	
				
				var url = "proxy/https/sapgw.mk-group.org:42080/sap/opu/odata/SAP/ZHR_GET_LEAVE_REQUESTS_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(url, false, user, pass);
				sap.ui.getCore().setModel(oModel); // for refreshing model from details
				oView.setModel(oModel);
				
				this.getView().attachAfterRendering(function() {
				
					var FilterOperator = sap.ui.model.FilterOperator;
					var filters = [new sap.ui.model.Filter("Mngpr", FilterOperator.EQ, userPernr)]
					
			        var oBinding = this.byId("requestList").getBinding("items");
			        oBinding.filter(filters);
				});  
		
			},
			
			
			btnLogOut:	function() {
				
				oJQueryStorage.remove("alr_login_username");
				oJQueryStorage.remove("alr_login_password");
				oJQueryStorage.remove("alr_user_pernr");

				this.getOwnerComponent().getRouter().navTo("Login", null, true);   

			},
			
			handleSelect: function(oEvent) {
				
			 	var oSelectedItem = oEvent.getParameter("listItem");
				var requestId = oSelectedItem.getBindingContext().getProperty("Reqid");
		
				if(sap.ui.Device.system.phone) {
					oSelectedItem.setSelected(false);
				}
				
				that.getOwnerComponent().getRouter().navTo("RequestDetails",{from: "Master", requestId: requestId}); 
		
			},
			
			handleSearch : function (oEvent) {
				
				// create model filter
				var filters = [];
				var query = oEvent.getParameter("query");

				filters = [new sap.ui.model.Filter("Mngpr", sap.ui.model.FilterOperator.EQ, userPernr),
							   new sap.ui.model.Filter("Sname", sap.ui.model.FilterOperator.EQ, query)]


				// update list binding
				var list = this.getView().byId("requestList");
				var binding = list.getBinding("items");
				binding.filter(filters);

			},
			
			handleRefresh: function() {
				
				var oView = this.getView();
				
				this.getView().byId("searchField").setValue("");
				
				setTimeout(jQuery.proxy(function () {
				
					var FilterOperator = sap.ui.model.FilterOperator;
					var filters = [new sap.ui.model.Filter("Mngpr", FilterOperator.EQ, userPernr)]
					
			        var oBinding = this.byId("requestList").getBinding("items");
			        oBinding.filter(filters);
			        
			        oView.byId("pullToRefresh").hide();
		        
				}, this), 1000);
				
			},
       
			onAfterRendering: function() {
				
				//MessageToast.show(userPernr);
				
			    if (userPernr == null) {
			    	this.getOwnerComponent().getRouter().navTo("Login", null, true);
			    } 

			}
			
			
		});
	}
);