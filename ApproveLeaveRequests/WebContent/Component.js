sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"mkbs/approveleaverequests/model/devices"
], function(UIComponent, Device, devices) { 
	"use strict";

	return UIComponent.extend("mkbs.approveleaverequests.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(devices.createDeviceModel(), "device");
			
			// create the views based on the url/hash
			this.getRouter().initialize();
		},
		
		destroy : function () {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
		
		
	});
});