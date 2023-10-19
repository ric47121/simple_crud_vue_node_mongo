window.addEventListener('beforeunload', function (event) {
    // event.preventDefault(); // Evita que el navegador cierre la ventana de inmediato
    // event.returnValue = ''; // Esto puede ser cualquier cadena de texto, activará el mensaje de confirmación del navegador
});

const API_URL = 'http://127.0.0.1:3058';

const app = new Vue({
    el: '#app',
    data: {
        sms: {
            _id: null,
            fecha: null,
            enviado: null,
            intentos: null,
            numero: null,
            mensaje: null,

            error: null,
            modo:'alta'
        },
        arrData: [],
        // mensajeSeleccionado: null, 
        
    },
    beforeDestroy() {
        // Importante: quitar el listener cuando el componente se destruye para evitar problemas de memoria
        //   window.removeEventListener('popstate', this.handleBackButtonPress);
    },
    async mounted() {

        await this.refreshMessages()

    },

    methods: {
        resetFormAltaEdit(){
            let obj = this.sms
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  obj[key] = null;
                }
              }
        },
        hideModalAlta() {
            const truck_modal = document.querySelector('#myModalAlta');
            const modal = bootstrap.Modal.getInstance(truck_modal);
            modal.hide();
        },
        showModalAlta() {
            let myModal = new bootstrap.Modal(document.getElementById('myModalAlta'))
            myModal.show()
            this.resetFormAltaEdit()
            this.sms.modo = 'alta'
        },
        showModalEdit(mensaje) {
            // console.log(mensaje)
            // this.mensajeSeleccionado = { ...mensaje }; // Clonamos el mensaje seleccionado
            this.sms = mensaje
            // console.log(this.mensajeSeleccionado)
            let myModal = new bootstrap.Modal(document.getElementById('myModalAlta'))
            myModal.show()
            this.sms.modo = 'edit'
        },
        showModalDelete(mensaje) {
            let r = confirm('confirma?')
            if(!r) return

            this.deleteSMS(mensaje._id)
            
        },

        async refreshMessages() {
            try {
                const response = await axios.get(`${API_URL}/mensajes`);
                this.arrData = response.data
                // console.log("data", response.data)
            } catch (error) {
                console.error("error", error);
            }
        },
        async altaSMS() {

            este = this.sms
            const mergedObject = {
                numero: este.numero,
                mensaje: este.mensaje,
            }

            try {
                const response = await axios.post(`${API_URL}/mensajes`, mergedObject);

                this.refreshMessages()
                this.hideModalAlta()

            } catch (error) {
                console.error("error", error);
            }
        },
        async editSMS() {

            este = this.sms
            const mergedObject = {                
                numero: este.numero,
                mensaje: este.mensaje,
            }

            try {
                const response = await axios.put(`${API_URL}/mensajes/` + this.sms._id, mergedObject);

                this.refreshMessages()
                this.hideModalAlta()

            } catch (error) {
                console.error("error", error);
            }
        },
        async deleteSMS(id) {

            try {
                const response = await axios.delete(`${API_URL}/mensajes/` + id);

                this.refreshMessages()

            } catch (error) {
                console.error("error", error);
            }
        },

    },


    filters: {
        sinDecimales(value) {
            if (value == 0) return '0.00'
            if (value > 1000) return parseFloat(value).toFixed(0)
            return value
        }
    },
    computed: {

    }

})

