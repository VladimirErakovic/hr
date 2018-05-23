sap.ui.define([
       	"sap/ui/core/mvc/Controller",
       	"sap/m/MessageBox",
       	"sap/m/MessageToast",
        "sap/ui/core/format/DateFormat",
       	"sap/m/Dialog",
       	"sap/ui/layout/HorizontalLayout",
       	"sap/ui/layout/VerticalLayout",
       	"sap/m/Text",
       	"sap/m/TextArea",
       	"sap/m/Button",
       	"jquery.sap.resources",
       	"jquery.sap.storage"
       ], function (Controller, MessageBox, MessageToast, DateFormat, 
    		   Dialog, HorizontalLayout, VerticalLayout, Text, TextArea, Button, jQuery) {
       "use strict";
       
       var that, oView, oBundle, user, pass, oJQueryStorage, sysUsername, userPernr;
       
       var beginDateDisplay, endDateDisplay, numberOfDays, hoursOfAbsence, absenceTypeText;
       
       var withdrawDialog, oDetailsModel, requestId;
   	
       return Controller.extend("mkbs.leaverequest.view.Details", {

			onInit: function() {
				
				that = this;
				
				oView = this.getView();
				
		        oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
		        
				user = oBundle.getText("GatewayUsername");
				pass = oBundle.getText("GatewayPassword");  
		        
				oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);					
				sysUsername = oJQueryStorage.get("alr_sys_uname");
				userPernr = oJQueryStorage.get("alr_user_pernr");
		        
			    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
				
			},
			
			
			handleRouteMatched : function (oEvent) {
				
				if (oEvent.getParameter("name") === "RequestDetails") {
					
					var oDateFormatLong = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-ddTHH:mm:ss", calendarType: sap.ui.core.CalendarType.Gregorian});
					var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd.MM.yyyy"});
					var floatFormatter = new Intl.NumberFormat('en-US', {
			        	minimumFractionDigits: 2
			        });
					
					var bindingContext = oView.getBindingContext();
					requestId = oEvent.getParameter("arguments").requestId;
					
					var urlDetails = "proxy/https/sapgw.mk-group.org:42080/sap/opu/odata/SAP/ZHR_GET_LR_HISTORY_SRV/";
					oDetailsModel = new sap.ui.model.odata.ODataModel(urlDetails, true, user, pass); 
					
					oDetailsModel.read("/EtHistDetailSet(ImReqid='" + requestId + "')", null, null, false, 
							function(oResponse) { // onSuccess function 

							    var managerName = oResponse.ExMname;

							    beginDateDisplay = oDateFormat.format(new Date(oResponse.ExBegda));
							    var beginDate = oDateFormatLong.format(new Date(oResponse.ExBegda));							    
							    endDateDisplay = oDateFormat.format(new Date(oResponse.ExEndda));
							    var endDate = oDateFormatLong.format(new Date(oResponse.ExEndda));

							    numberOfDays = parseInt(oResponse.ExAbwtg);
							    hoursOfAbsence = floatFormatter.format(parseFloat(oResponse.ExStdaz).toFixed(2));
		
							    var requestDate = oDateFormat.format(new Date(oResponse.ExEdate));
							    var approvedDate = oDateFormat.format(new Date(oResponse.ExMdate));
							    var isApproved = oResponse.ExApprv;
							    var rejectComment = oResponse.ExRejct;
							    var userComment = oResponse.ExCmmnt;
	
							    absenceTypeText = oResponse.ExAtext;
							    
							    var numberValue;
							    var numberUnit = "";
							    if (numberOfDays == 0 && absenceTypeText == "") {	// ovo je zato sto u servisu nema Awart!!!
							    	absenceTypeText = "Izlazak sa posla";
							    	numberValue = hoursOfAbsence; 
							    	numberUnit = oBundle.getText("ListUnitHours");
							    } else {
							    	numberValue = numberOfDays;
							    	numberUnit = oBundle.getText("ListUnitDays");
							    }
	
							    
							    
								oView.byId("requestDetailHeader")
								.setTitle(absenceTypeText)
								.setNumber(numberValue)
								.setNumberUnit(numberUnit);
								
								if (isApproved === ""){
									oView.byId("reqStatus").setText(oBundle.getText("StatusSent")).setState("None");
									oView.byId("withdrawButton").setEnabled(true);
								} else if (isApproved === "1") {
									oView.byId("reqStatus").setText(oBundle.getText("StatusApproved")).setState("Success");
									oView.byId("withdrawButton").setEnabled(false);
								} else if (isApproved === "2") {
									oView.byId("reqStatus").setText(oBundle.getText("StatusWithdrawn")).setState("Warning");
									oView.byId("withdrawButton").setEnabled(false);
								} else {
									oView.byId("reqStatus").setText(oBundle.getText("StatusRejected")).setState("Error");
									oView.byId("withdrawButton").setEnabled(false);
								}
								
								var headerAttributes = {}; 
								headerAttributes =  oView.byId("requestDetailHeader").getAttributes();
								headerAttributes[0].setText("Od: " + beginDateDisplay + " do: " + endDateDisplay);
								headerAttributes[1].setText(requestDate); 
								headerAttributes[2].setText(userComment);
													
								if (rejectComment === "") {
									oView.byId("commentTab").setCount("");
									oView.byId("bossNameLabel").setText("");
									oView.byId("commentValue").setText("");
								} else {
									oView.byId("commentTab").setCount("1");
									oView.byId("bossNameLabel").setText(managerName);
									oView.byId("commentValue").setText(rejectComment);
								}
								
								if (isApproved === ""){
									oView.byId("dateLabel").setVisible(false);
									oView.byId("commentDate").setText("");
								} else if (isApproved === "2") {
									oView.byId("dateLabel").setVisible(false);
									oView.byId("commentDate").setText("");
								} else {
									oView.byId("dateLabel").setVisible(true);
									oView.byId("commentDate").setText(approvedDate);
								}
							    
						
							}, 		
							function(oError) { // onError function
				
							    sap.m.MessageBox.show(
							    		oBundle.getText("CheckInternetConnection"), {
								          icon: MessageBox.Icon.ERROR,
								          title: oBundle.getText("Error"),
								          actions: MessageBox.Action.OK
								      }
								);
					
							}
					);
				
				}
			},
			
			
			btnWithdraw: function(oEvent) {
				
				withdrawDialog = new Dialog({
					title: oBundle.getText("WithdrawalDialogTitle"),
					type: 'Message',
					content: [
						new VerticalLayout({
							content: [
								new Text({ text: oBundle.getText("WithdrawRequestQuestion")}),
								new Text({ text: " " }),
								new HorizontalLayout({
									width: "100%",
									content: [
										new VerticalLayout({
											width: "120px",
											content: [
												new Text({ text: oBundle.getText("AbsenceType")}),
												new Text({ text: oBundle.getText("DialogFrom") }),
												new Text({ text: oBundle.getText("DialogTo") }),
												new Text({ text: oBundle.getText("DaysRequested") })
											]
										}),
										new VerticalLayout({
											content: [
												new Text({ text: absenceTypeText }),
												new Text({ text: beginDateDisplay }),
												new Text({ text: endDateDisplay }),
												new Text({ text: numberOfDays })
											]
										})
									]
								})
							]
						})
					],
					beginButton: new Button({
						text: oBundle.getText("WitdrawalButton"),  
						tap: [ this.onSendWithdrawal, this ]
					}),
					endButton: new Button({
						text: oBundle.getText("CancelButton"),
						press: function () {
							withdrawDialog.close();
						}
					}),
					afterClose: function() {
						withdrawDialog.setBusy(false);
						withdrawDialog.destroy();
					}
				});

				withdrawDialog.open();					
				
			},
			
			onSendWithdrawal: function() {
				
				withdrawDialog.setBusy(true);
				
				oDetailsModel.read("/EtWithdrawSet(ImReqid='" + requestId + "')", null, null, true, 
						function(oResponse) { 
			
						    var message = oResponse.ExMessage;
						    			    
						    MessageToast.show(message);
						    
						    withdrawDialog.close();
						    
						    // refresh master list
							sap.ui.getCore().getModel("oModelHistory").refresh();
							// set no item page
							that.getOwnerComponent().getRouter().navTo("Master" ,{});
							
			
						}, 		
						function(oError) {
			
						    sap.m.MessageBox.show(
						    		oBundle.getText("CheckInternetConnection"), {
							          icon: MessageBox.Icon.ERROR,
							          title: oBundle.getText("Error"),
							          actions: MessageBox.Action.OK
							      }
							);
				
						}
					);	
							
			},
			
			
			handleNavButtonPress: function() {
				
				that.getOwnerComponent().getRouter().navTo("Master");
				
			}
			

		});
	}
);