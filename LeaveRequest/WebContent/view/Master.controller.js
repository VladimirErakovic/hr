sap.ui.define([
    	"sap/ui/core/mvc/Controller",
    	"sap/m/MessageBox",
    	"sap/ui/core/routing/History",
    	"mkbs/leaverequest/utils/Formatter",
    	"jquery.sap.resources",
    	"jquery.sap.storage"
       ], function (Controller, MessageBox, History, Formatter, jQuery) {
       "use strict";
       
       var that, oJQueryStorage, userPernr, user, pass, oView;
       
       return Controller.extend("mkbs.leaverequest.view.Master", {
    	   
    	   
			onInit: function() {
				
				that = this;
				
				userPernr = null;
							
				oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);					
				userPernr = oJQueryStorage.get("user_pernr");
							
		        	var oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
				
				user = oBundle.getText("GatewayUsername");
				pass = oBundle.getText("GatewayPassword");
					
				oView = this.getView().byId("historyList");	
				
				var url = "proxy/https/***/sap/opu/odata/SAP/ZHR_GET_LR_HISTORY_SRV/";
				var oModelHistory = new sap.ui.model.odata.ODataModel(url, false, user, pass);
				sap.ui.getCore().setModel(oModelHistory, "oModelHistory"); // for refreshing model from details
				oView.setModel(oModelHistory);
				
				this.getView().attachAfterRendering(function() {
				
					var FilterOperator = sap.ui.model.FilterOperator;
					var filters = [new sap.ui.model.Filter("Pernr", FilterOperator.EQ, userPernr)]
					
			        var oBinding = this.byId("historyList").getBinding("items");
			        oBinding.filter(filters);
				});  
				
			},

			
			handleSelect: function(oEvent) {
				
			 	var oSelectedItem = oEvent.getParameter("listItem");
				var requestId = oSelectedItem.getBindingContext().getProperty("Reqid");
		
				if(sap.ui.Device.system.phone) {
					oSelectedItem.setSelected(false);
				}
				
				that.getOwnerComponent().getRouter().navTo("RequestDetails",{from: "Master", requestId: requestId}); 
		
			},
			
			navigationBack: function() {
				
				this.getOwnerComponent().getRouter().navTo("Main" ,{});
				
			},
			
			handleRefresh: function() {
				
				var oView = this.getView();
				
				setTimeout(jQuery.proxy(function () {
				
					var FilterOperator = sap.ui.model.FilterOperator;
					var filters = [new sap.ui.model.Filter("Pernr", FilterOperator.EQ, userPernr)]
					
			        var oBinding = this.byId("historyList").getBinding("items");
			        oBinding.filter(filters);
		        
			        oView.byId("pullToRefresh").hide();
		        
				}, this), 1000);
				
			}
    	   
		
		});
	}
);
