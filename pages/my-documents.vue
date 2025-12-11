<template>
  <div class="documents-container">
    <div class="documents-header">
      <!-- Client Name Display -->
      <div v-if="clientName" class="client-name-section">
        <q-icon name="person" size="24px" />
        <h2 class="client-name">Bienvenido, {{ clientName }}</h2>
      </div>
      
      <h1 class="documents-title">Mis Documentos</h1>
      <p class="documents-subtitle">Gestiona y visualiza el estado de tus documentos</p>
    </div>

    <q-card class="documents-card" v-if="!loading">
      <q-card-section>
        <!-- Progress Section -->
        <div class="progress-section">
          <q-linear-progress
            :value="uploadProgress / 100"
            color="positive"
            size="12px"
            class="q-mb-sm"
          />
          <p class="progress-text">
            {{ uploadProgress === 100
              ? '¡Todos los documentos han sido subidos!'
              : `${uploadedCount} de ${totalRequired} documentos listos`
            }}
          </p>
        </div>

        <!-- Document Categories -->
        <div class="q-gutter-lg documents-list">
          <!-- Identification Documents -->
          <div class="document-category">
            <div class="category-header">
              <q-icon name="badge" size="24px" />
              <h2 class="category-title">Identificación Oficial</h2>
              <q-badge :color="idDocumentsComplete ? 'positive' : 'warning'" class="q-ml-sm">
                {{ idDocumentsComplete ? 'Completo' : 'Pendiente' }}
              </q-badge>
            </div>

            <div class="document-items">
              <!-- ID Front -->
              <q-card class="document-item" bordered>
                <q-card-section>
                  <div class="document-item-content">
                    <div class="document-info">
                      <h3 class="document-name">Frente de la INE/IFE</h3>
                      <q-badge :color="getDocumentBadgeColor(documentsStatus.idDocumentFront)" class="q-mt-xs">
                        {{ getDocumentStatusLabel(documentsStatus.idDocumentFront) }}
                      </q-badge>
                    </div>
                    <div class="document-actions">
                      <q-icon
                        :name="getDocumentIconName(documentsStatus.idDocumentFront)"
                        size="32px"
                        :color="getDocumentColor(documentsStatus.idDocumentFront)"
                      />
                      <q-btn
                        size="sm"
                        color="primary"
                        outline
                        @click="toggleUpload('idDocumentFront')"
                        class="upload-toggle-btn"
                      >
                        {{ expandedUploads.idDocumentFront ? 'Ocultar' : 'Subir/Actualizar' }}
                      </q-btn>
                    </div>
                  </div>
                  
                  <!-- Upload Section -->
                  <div v-if="expandedUploads.idDocumentFront" class="upload-section">
                    <!-- Hidden file input for direct access -->
                    <input
                      ref="idDocumentFrontFileInput"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      style="display: none;"
                      @change="(e) => handleFileInputChange('idDocumentFront', e)"
                    />
                    
                    <q-uploader
                      ref="idDocumentFrontUploader"
                      :max-files="1"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      @added="(info) => handleFileSelect('idDocumentFront', info.files[0])"
                      @added-files="(files) => handleFileSelect('idDocumentFront', files[0])"
                      hide-upload-btn
                      flat
                      bordered
                      class="full-width uploader-component"
                      style="min-height: 120px; position: relative;"
                    >
                      <template v-slot:header="scope">
                        <div 
                          class="row no-wrap items-center q-pa-md q-gutter-xs uploader-header"
                          style="cursor: pointer; min-height: 100px; position: relative; z-index: 1;"
                          @click="triggerFileInput('idDocumentFront')"
                        >
                          <q-btn 
                            v-if="scope.queuedFiles.length > 0" 
                            icon="clear" 
                            @click.stop="scope.removeQueuedFiles" 
                            round 
                            dense 
                            flat 
                          />
                          <div class="col text-center">
                            <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-sm" />
                            <div class="q-uploader__title text-h6">Arrastra un archivo aquí o haz clic para seleccionar</div>
                            <div class="q-uploader__subtitle text-caption">PDF, JPG, PNG (máx. 10MB)</div>
                          </div>
                        </div>
                      </template>
                    </q-uploader>
                    
                    <div v-if="selectedFiles.idDocumentFront" class="selected-file-info">
                      <q-icon name="description" size="20px" />
                      <span>{{ selectedFiles.idDocumentFront.name }}</span>
                      <q-btn
                        size="xs"
                        color="negative"
                        flat
                        dense
                        @click="clearFile('idDocumentFront')"
                      >
                        Eliminar
                      </q-btn>
                    </div>
                    
                    <q-btn
                      v-if="selectedFiles.idDocumentFront"
                      color="primary"
                      class="full-width upload-submit-btn q-mt-md"
                      :loading="uploading.idDocumentFront"
                      @click="uploadDocument('idDocumentFront', 'officialIdFrontClient')"
                    >
                      Subir Documento
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>

              <!-- ID Reverse -->
              <q-card class="document-item" bordered>
                <q-card-section>
                  <div class="document-item-content">
                    <div class="document-info">
                      <h3 class="document-name">Reverso de la INE/IFE</h3>
                      <q-badge :color="getDocumentBadgeColor(documentsStatus.idDocumentReverse)" class="q-mt-xs">
                        {{ getDocumentStatusLabel(documentsStatus.idDocumentReverse) }}
                      </q-badge>
                    </div>
                    <div class="document-actions">
                      <q-icon
                        :name="getDocumentIconName(documentsStatus.idDocumentReverse)"
                        size="32px"
                        :color="getDocumentColor(documentsStatus.idDocumentReverse)"
                      />
                      <q-btn
                        size="sm"
                        color="primary"
                        outline
                        @click="toggleUpload('idDocumentReverse')"
                        class="upload-toggle-btn"
                      >
                        {{ expandedUploads.idDocumentReverse ? 'Ocultar' : 'Subir/Actualizar' }}
                      </q-btn>
                    </div>
                  </div>
                  
                  <!-- Upload Section -->
                  <div v-if="expandedUploads.idDocumentReverse" class="upload-section">
                    <!-- Hidden file input for direct access -->
                    <input
                      ref="idDocumentReverseFileInput"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      style="display: none;"
                      @change="(e) => handleFileInputChange('idDocumentReverse', e)"
                    />
                    
                    <q-uploader
                      ref="idDocumentReverseUploader"
                      :max-files="1"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      @added="(info) => handleFileSelect('idDocumentReverse', info.files[0])"
                      @added-files="(files) => handleFileSelect('idDocumentReverse', files[0])"
                      hide-upload-btn
                      flat
                      bordered
                      class="full-width uploader-component"
                      style="min-height: 120px; position: relative;"
                    >
                      <template v-slot:header="scope">
                        <div 
                          class="row no-wrap items-center q-pa-md q-gutter-xs uploader-header"
                          style="cursor: pointer; min-height: 100px; position: relative; z-index: 1;"
                          @click="triggerFileInput('idDocumentReverse')"
                        >
                          <q-btn 
                            v-if="scope.queuedFiles.length > 0" 
                            icon="clear" 
                            @click.stop="scope.removeQueuedFiles" 
                            round 
                            dense 
                            flat 
                          />
                          <div class="col text-center">
                            <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-sm" />
                            <div class="q-uploader__title text-h6">Arrastra un archivo aquí o haz clic para seleccionar</div>
                            <div class="q-uploader__subtitle text-caption">PDF, JPG, PNG (máx. 10MB)</div>
                          </div>
                        </div>
                      </template>
                    </q-uploader>
                    
                    <div v-if="selectedFiles.idDocumentReverse" class="selected-file-info">
                      <q-icon name="description" size="20px" />
                      <span>{{ selectedFiles.idDocumentReverse.name }}</span>
                      <q-btn
                        size="xs"
                        color="negative"
                        flat
                        dense
                        @click="clearFile('idDocumentReverse')"
                      >
                        Eliminar
                      </q-btn>
                    </div>
                    
                    <q-btn
                      v-if="selectedFiles.idDocumentReverse"
                      color="primary"
                      class="full-width upload-submit-btn q-mt-md"
                      :loading="uploading.idDocumentReverse"
                      @click="uploadDocument('idDocumentReverse', 'officialIdReverseClient')"
                    >
                      Subir Documento
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Supporting Documents -->
          <div class="document-category">
            <div class="category-header">
              <q-icon name="folder" size="24px" />
              <h2 class="category-title">Documentos de Apoyo</h2>
              <q-badge :color="supportingDocumentsComplete ? 'positive' : 'warning'" class="q-ml-sm">
                {{ supportingDocumentsComplete ? 'Completo' : 'Pendiente' }}
              </q-badge>
            </div>

            <div class="document-items">
              <!-- Address Proof -->
              <q-card class="document-item" bordered>
                <q-card-section>
                  <div class="document-item-content">
                    <div class="document-info">
                      <h3 class="document-name">Comprobante de Domicilio</h3>
                      <q-badge :color="getDocumentBadgeColor(documentsStatus.addressProof)" class="q-mt-xs">
                        {{ getDocumentStatusLabel(documentsStatus.addressProof) }}
                      </q-badge>
                    </div>
                    <div class="document-actions">
                      <q-icon
                        :name="getDocumentIconName(documentsStatus.addressProof)"
                        size="32px"
                        :color="getDocumentColor(documentsStatus.addressProof)"
                      />
                      <q-btn
                        size="sm"
                        color="primary"
                        outline
                        @click="toggleUpload('addressProof')"
                        class="upload-toggle-btn"
                      >
                        {{ expandedUploads.addressProof ? 'Ocultar' : 'Subir/Actualizar' }}
                      </q-btn>
                    </div>
                  </div>
                  
                  <!-- Upload Section -->
                  <div v-if="expandedUploads.addressProof" class="upload-section">
                    <!-- Hidden file input for direct access -->
                    <input
                      ref="addressProofFileInput"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      style="display: none;"
                      @change="(e) => handleFileInputChange('addressProof', e)"
                    />
                    
                    <q-uploader
                      ref="addressProofUploader"
                      :max-files="1"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                      @added="(info) => handleFileSelect('addressProof', info.files[0])"
                      @added-files="(files) => handleFileSelect('addressProof', files[0])"
                      hide-upload-btn
                      flat
                      bordered
                      class="full-width uploader-component"
                      style="min-height: 120px; position: relative;"
                    >
                      <template v-slot:header="scope">
                        <div 
                          class="row no-wrap items-center q-pa-md q-gutter-xs uploader-header"
                          style="cursor: pointer; min-height: 100px; position: relative; z-index: 1;"
                          @click="triggerFileInput('addressProof')"
                        >
                          <q-btn 
                            v-if="scope.queuedFiles.length > 0" 
                            icon="clear" 
                            @click.stop="scope.removeQueuedFiles" 
                            round 
                            dense 
                            flat 
                          />
                          <div class="col text-center">
                            <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-sm" />
                            <div class="q-uploader__title text-h6">Arrastra un archivo aquí o haz clic para seleccionar</div>
                            <div class="q-uploader__subtitle text-caption">PDF, JPG, PNG (máx. 10MB)</div>
                          </div>
                        </div>
                      </template>
                    </q-uploader>
                    
                    <div v-if="selectedFiles.addressProof" class="selected-file-info">
                      <q-icon name="description" size="20px" />
                      <span>{{ selectedFiles.addressProof.name }}</span>
                      <q-btn
                        size="xs"
                        color="negative"
                        flat
                        dense
                        @click="clearFile('addressProof')"
                      >
                        Eliminar
                      </q-btn>
                    </div>
                    
                    <q-btn
                      v-if="selectedFiles.addressProof"
                      color="primary"
                      class="full-width upload-submit-btn q-mt-md"
                      :loading="uploading.addressProof"
                      @click="uploadDocument('addressProof', 'addressProofClient')"
                    >
                      Subir Documento
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Income Proofs -->
              <q-card
                v-for="(proof, idx) in incomeProofs"
                :key="proof.id || idx"
                class="document-item"
                bordered
              >
                <q-card-section>
                  <div class="document-item-content">
                    <div class="document-info">
                      <h3 class="document-name">
                        Comprobante de Ingresos {{ idx + 1 }}
                        <span v-if="proof.month" class="document-meta">
                          ({{ getMonthLabel(proof.month) }})
                        </span>
                      </h3>
                      <q-badge :color="getDocumentBadgeColor(proof.status)" class="q-mt-xs">
                        {{ getDocumentStatusLabel(proof.status) }}
                      </q-badge>
                    </div>
                    <div class="document-actions">
                      <q-icon
                        :name="getDocumentIconName(proof.status)"
                        size="32px"
                        :color="getDocumentColor(proof.status)"
                      />
                      <q-btn
                        size="sm"
                        color="primary"
                        outline
                        @click="toggleIncomeProofUpload(idx)"
                        class="upload-toggle-btn"
                      >
                        {{ expandedUploads[`incomeProof${idx}`] ? 'Ocultar' : 'Subir/Actualizar' }}
                      </q-btn>
                    </div>
                  </div>
                  
                  <!-- Income Proof Upload Section -->
                  <div v-if="expandedUploads[`incomeProof${idx}`]" class="upload-section">
                    <div class="q-gutter-md">
                      <!-- Month Selection -->
                      <q-select
                        v-model="proof.month"
                        :options="availableMonths"
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        label="Mes del documento"
                        outlined
                        clearable
                      />
                      
                      <!-- Type Selection -->
                      <q-select
                        v-model="proof.type"
                        :options="incomeProofTypeOptions"
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        label="Tipo de comprobante"
                        outlined
                        clearable
                      />
                      
                      <!-- Sequence Number (for payroll slips) -->
                      <q-input
                        v-if="proof.type === 'payrollSlipe'"
                        v-model.number="proof.sequence_number"
                        type="number"
                        :min="1"
                        :max="999"
                        label="Número de Nómina/Recibo"
                        outlined
                        placeholder="Número de nómina"
                      />
                      
                      <!-- File Upload -->
                      <!-- Hidden file input for direct access -->
                      <input
                        :ref="(el) => { if (el) incomeProofFileInputs[idx] = el as HTMLInputElement }"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                        style="display: none;"
                        @change="(e) => handleIncomeProofFileInputChange(idx, e)"
                      />
                      
                      <q-uploader
                        v-if="proof.month && proof.type && (proof.type !== 'payrollSlipe' || proof.sequence_number)"
                        :ref="`incomeProofUploader${idx}`"
                        :max-files="1"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                        @added="(info) => handleIncomeProofFileSelect(idx, info.files[0])"
                        @added-files="(files) => handleIncomeProofFileSelect(idx, files[0])"
                        hide-upload-btn
                        flat
                        bordered
                        class="full-width uploader-component"
                        style="min-height: 120px; position: relative;"
                      >
                        <template v-slot:header="scope">
                          <div 
                            class="row no-wrap items-center q-pa-md q-gutter-xs uploader-header"
                            style="cursor: pointer; min-height: 100px; position: relative; z-index: 1;"
                            @click="triggerFileInput(`incomeProof${idx}`)"
                          >
                            <q-btn 
                              v-if="scope.queuedFiles.length > 0" 
                              icon="clear" 
                              @click.stop="scope.removeQueuedFiles" 
                              round 
                              dense 
                              flat 
                            />
                            <div class="col text-center">
                              <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-sm" />
                              <div class="q-uploader__title text-h6">Arrastra un archivo aquí o haz clic para seleccionar</div>
                              <div class="q-uploader__subtitle text-caption">PDF, JPG, PNG (máx. 10MB)</div>
                            </div>
                          </div>
                        </template>
                      </q-uploader>
                      
                      <div v-else class="upload-hint-box">
                        <q-icon name="info" size="20px" />
                        <span>Selecciona primero el mes y tipo del documento</span>
                      </div>
                      
                      <div v-if="selectedIncomeProofFiles[idx]" class="selected-file-info">
                        <q-icon name="description" size="20px" />
                        <span>{{ selectedIncomeProofFiles[idx].name }}</span>
                        <q-btn
                          size="xs"
                          color="negative"
                          flat
                          dense
                          @click="clearIncomeProofFile(idx)"
                        >
                          Eliminar
                        </q-btn>
                      </div>
                      
                      <q-btn
                        v-if="selectedIncomeProofFiles[idx] && proof.month && proof.type"
                        color="primary"
                        class="full-width upload-submit-btn"
                        :loading="uploading[`incomeProof${idx}`]"
                        @click="uploadIncomeProof(idx)"
                      >
                        Subir Documento
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <!-- Add Income Proof Button -->
              <q-card class="document-item add-proof-card" bordered>
                <q-card-section>
                  <q-btn
                    color="primary"
                    outline
                    class="full-width add-proof-btn"
                    @click="addIncomeProof"
                  >
                    <q-icon name="add" class="q-mr-sm" />
                    Añadir Comprobante de Ingresos
                  </q-btn>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <q-card v-else class="documents-card">
      <q-card-section>
        <div class="loading-container">
          <q-spinner size="3rem" color="primary" />
          <p class="loading-text">Cargando documentos...</p>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

// Add Inter font
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    }
  ]
})

const $q = useQuasar()
const clientStore = useClientStore()
const router = useRouter()

// Refs for file inputs (for direct access)
const idDocumentFrontFileInput = ref<HTMLInputElement | null>(null)
const idDocumentReverseFileInput = ref<HTMLInputElement | null>(null)
const addressProofFileInput = ref<HTMLInputElement | null>(null)
const incomeProofFileInputs = ref<{ [key: number]: HTMLInputElement | null }>({})

// Types
interface DocumentStatus {
  idDocumentFront: string | null
  idDocumentReverse: string | null
  addressProof: string | null
}

interface IncomeProof {
  id: number | null
  month: number | null
  type: string | null
  status: string | null
  sequence_number: number | null
  file?: File | null
}

// State
const loading = ref(true)
const documentsStatus = ref<DocumentStatus>({
  idDocumentFront: null,
  idDocumentReverse: null,
  addressProof: null
})
const incomeProofs = ref<IncomeProof[]>([])

// Upload state
const expandedUploads = ref<Record<string, boolean>>({})
const selectedFiles = ref<Record<string, File>>({})
const selectedIncomeProofFiles = ref<Record<number, File>>({})
const uploading = ref<Record<string, boolean>>({})

// Available months
const availableMonths = computed(() => {
  const months = []
  const currentDate = new Date()
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    })
    months.push({
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      value: date.getMonth() + 1
    })
  }
  return months
})

// Income proof type options
const incomeProofTypeOptions = [
  { label: 'Estado de cuenta', value: 'bankStatement' },
  { label: 'Comprobante de nómina', value: 'payrollSlipe' },
  { label: 'Otro', value: 'Others' }
]

// Computed
const totalRequired = computed(() => {
  return 4
})

const uploadedCount = computed(() => {
  let count = 0
  if (documentsStatus.value.idDocumentFront === 'validated') count++
  if (documentsStatus.value.idDocumentReverse === 'validated') count++
  if (documentsStatus.value.addressProof === 'validated') count++
  if (incomeProofs.value.some(p => p.status === 'validated')) count++
  return count
})

const uploadProgress = computed(() => {
  return Math.round((uploadedCount.value / totalRequired.value) * 100)
})

const idDocumentsComplete = computed(() => {
  return documentsStatus.value.idDocumentFront === 'validated' &&
    documentsStatus.value.idDocumentReverse === 'validated'
})

const supportingDocumentsComplete = computed(() => {
  return documentsStatus.value.addressProof === 'validated' &&
    incomeProofs.value.some(p => p.status === 'validated')
})

const clientName = computed(() => {
  const name = clientStore.client.name || ''
  const lastName = clientStore.client.first_last_name || ''
  if (name && lastName) {
    return `${name} ${lastName}`.trim()
  }
  return name || lastName || ''
})

// Methods
function getDocumentStatusLabel(status: string | null) {
  if (status === 'validated') return 'Validado'
  if (status === 'validating') return 'Validando'
  return 'Pendiente'
}

function getDocumentBadgeColor(status: string | null) {
  if (status === 'validated') return 'positive'
  if (status === 'validating') return 'warning'
  return 'grey'
}

function getDocumentIconName(status: string | null) {
  if (status === 'validated') return 'check_circle'
  if (status === 'validating') return 'schedule'
  return 'cancel'
}

function getDocumentColor(status: string | null) {
  if (status === 'validated') return '#26e085'
  if (status === 'validating') return '#f59e0b'
  return '#9ca3af'
}

function getMonthLabel(month: number) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[month - 1] || `Mes ${month}`
}

function toggleUpload(type: string) {
  expandedUploads.value[type] = !expandedUploads.value[type]
}

function triggerFileInput(type: string) {
  // Use the ref to access the file input directly
  let fileInput: HTMLInputElement | null = null
  
  if (type === 'idDocumentFront' && idDocumentFrontFileInput.value) {
    fileInput = idDocumentFrontFileInput.value
  } else if (type === 'idDocumentReverse' && idDocumentReverseFileInput.value) {
    fileInput = idDocumentReverseFileInput.value
  } else if (type === 'addressProof' && addressProofFileInput.value) {
    fileInput = addressProofFileInput.value
  } else if (type.startsWith('incomeProof')) {
    const index = parseInt(type.replace('incomeProof', ''))
    if (incomeProofFileInputs.value[index]) {
      fileInput = incomeProofFileInputs.value[index]
    }
  }
  
  if (fileInput) {
    fileInput.click()
    return
  }
  
  // Fallback: find file input in the upload section
  setTimeout(() => {
    const uploadSections = document.querySelectorAll('.upload-section')
    for (const section of uploadSections) {
      const style = window.getComputedStyle(section)
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        // Try to find the hidden input first
        const hiddenInput = section.querySelector('input[type="file"][style*="display: none"]') as HTMLInputElement
        if (hiddenInput) {
          hiddenInput.click()
          return
        }
        // Fallback to any file input
        const fileInput = section.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          fileInput.click()
          return
        }
      }
    }
  }, 50)
}

function handleFileInputChange(type: string, event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFileSelect(type, target.files[0])
    // Reset the input so the same file can be selected again if needed
    target.value = ''
  }
}

function handleIncomeProofFileInputChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleIncomeProofFileSelect(index, target.files[0])
    // Reset the input so the same file can be selected again if needed
    target.value = ''
  }
}

function toggleIncomeProofUpload(index: number) {
  const key = `incomeProof${index}`
  expandedUploads.value[key] = !expandedUploads.value[key]
}

function handleFileSelect(type: string, file: File) {
  if (!file || !file.name) {
    $q.notify({
      type: 'negative',
      message: 'El archivo seleccionado no es válido'
    })
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'El archivo es demasiado grande. Máximo 10MB.'
    })
    return
  }
  
  const validExtensions = ['pdf', 'jpg', 'jpeg', 'png']
  const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  
  const fileNameParts = file.name.split('.')
  const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase().trim() : null
  const fileMimeType = (file.type || '').toLowerCase().trim()
  
  const isValidExtension = fileExtension ? validExtensions.includes(fileExtension) : false
  const isValidMimeType = fileMimeType ? (
    validMimeTypes.includes(fileMimeType) ||
    fileMimeType.startsWith('image/') && (fileMimeType.includes('jpeg') || fileMimeType.includes('jpg') || fileMimeType.includes('png')) ||
    fileMimeType === 'application/pdf'
  ) : false
  
  if (!isValidExtension && !isValidMimeType) {
    if (fileExtension || fileMimeType) {
      $q.notify({
        type: 'negative',
        message: 'Tipo de archivo no válido. Solo se permiten PDF, JPG, JPEG y PNG.'
      })
      return
    }
  }
  
  selectedFiles.value[type] = file
}

function handleIncomeProofFileSelect(index: number, file: File) {
  if (!file || !file.name) {
    $q.notify({
      type: 'negative',
      message: 'El archivo seleccionado no es válido'
    })
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'El archivo es demasiado grande. Máximo 10MB.'
    })
    return
  }
  
  const validExtensions = ['pdf', 'jpg', 'jpeg', 'png']
  const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  
  const fileNameParts = file.name.split('.')
  const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase().trim() : null
  const fileMimeType = (file.type || '').toLowerCase().trim()
  
  const isValidExtension = fileExtension ? validExtensions.includes(fileExtension) : false
  const isValidMimeType = fileMimeType ? (
    validMimeTypes.includes(fileMimeType) ||
    fileMimeType.startsWith('image/') && (fileMimeType.includes('jpeg') || fileMimeType.includes('jpg') || fileMimeType.includes('png')) ||
    fileMimeType === 'application/pdf'
  ) : false
  
  if (!isValidExtension && !isValidMimeType) {
    if (fileExtension || fileMimeType) {
      $q.notify({
        type: 'negative',
        message: 'Tipo de archivo no válido. Solo se permiten PDF, JPG, JPEG y PNG.'
      })
      return
    }
  }
  
  selectedIncomeProofFiles.value[index] = file
  if (!incomeProofs.value[index]) {
    incomeProofs.value[index] = {
      id: null,
      month: null,
      type: null,
      status: null,
      sequence_number: null,
      file: file
    }
  } else {
    incomeProofs.value[index].file = file
  }
}

function clearFile(type: string) {
  delete selectedFiles.value[type]
}

function clearIncomeProofFile(index: number) {
  delete selectedIncomeProofFiles.value[index]
  if (incomeProofs.value[index]) {
    incomeProofs.value[index].file = null
  }
}

async function uploadDocument(type: string, uploadType: string) {
  const file = selectedFiles.value[type]
  if (!file) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona un archivo'
    })
    return
  }

  if (!file || !file.name || typeof file.name !== 'string') {
    $q.notify({
      type: 'negative',
      message: 'El archivo seleccionado no es válido. Por favor, selecciona otro archivo.'
    })
    return
  }

  if (!clientStore.client.id) {
    $q.notify({
      type: 'negative',
      message: 'No se encontró información del cliente. Por favor, inicia sesión.'
    })
    router.push('/login')
    return
  }

  uploading.value[type] = true
  
  try {
    const fileToUpload = new File([file], file.name, { type: file.type || 'application/octet-stream' })
    await clientStore.uploadFile(uploadType, fileToUpload)
    $q.notify({
      type: 'positive',
      message: 'Documento subido correctamente'
    })
    
    delete selectedFiles.value[type]
    expandedUploads.value[type] = false
    await loadDocuments()
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Error al subir el documento. Por favor, intenta de nuevo.'
    })
  } finally {
    uploading.value[type] = false
  }
}

async function uploadIncomeProof(index: number) {
  const proof = incomeProofs.value[index]
  
  if (!selectedIncomeProofFiles.value[index]) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona un archivo'
    })
    return
  }

  if (!proof.month || !proof.type) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, completa el mes y tipo del documento'
    })
    return
  }

  if (proof.type === 'payrollSlipe' && !proof.sequence_number) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, ingresa el número de nómina/recibo'
    })
    return
  }

  if (!clientStore.client.id) {
    $q.notify({
      type: 'negative',
      message: 'No se encontró información del cliente. Por favor, inicia sesión.'
    })
    router.push('/login')
    return
  }

  const uploadKey = `incomeProof${index}`
  uploading.value[uploadKey] = true

  try {
    const nuxtApp = useNuxtApp()
    const axios = nuxtApp.$axios as any
    const formData = new FormData()
    
    const file = selectedIncomeProofFiles.value[index]
    const fileExtension = file.name.split('.').pop()
    const newFileName = `incomeProofClient.${fileExtension}`
    const renamedFile = new File([file], newFileName, { type: file.type })

    formData.append('file_type', 'incomeProof')
    formData.append('file', renamedFile)
    formData.append('month', proof.month.toString())
    formData.append('document_type', proof.type)
    if (proof.sequence_number) {
      formData.append('sequence_number', proof.sequence_number.toString())
    }
    formData.append('validated', 'false')

    await axios.post(`/document/${clientStore.client.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        type: 'incomeProof'
      }
    })

    $q.notify({
      type: 'positive',
      message: 'Comprobante de ingresos subido correctamente'
    })
    
    delete selectedIncomeProofFiles.value[index]
    expandedUploads.value[uploadKey] = false
    await loadDocuments()
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Error al subir el comprobante. Por favor, intenta de nuevo.'
    })
  } finally {
    uploading.value[uploadKey] = false
  }
}

function addIncomeProof() {
  incomeProofs.value.push({
    id: null,
    month: null,
    type: null,
    status: null,
    sequence_number: null,
    file: null
  })
  const index = incomeProofs.value.length - 1
  toggleIncomeProofUpload(index)
}

async function loadDocuments() {
  loading.value = true
  try {
    if (!clientStore.client.id) {
      const clientData = await clientStore.getClient() as any
      if (!clientData?.client_id) {
        $q.notify({
          type: 'warning',
          message: 'No se encontró información del cliente. Por favor, inicia sesión.'
        })
        router.push('/login')
        return
      }
    }

    const validation = await clientStore.getClient() as any
    const files = validation?.files || {}
    const { addressProof, officialId_front, officialId_reverse, income_proof_documents } = files

    const getValidationState = (status: string | null | undefined): string | null => {
      if (!status) return null
      return status === 'validated' ? 'validated' : status === 'validating' ? 'validating' : null
    }

    documentsStatus.value = {
      idDocumentFront: getValidationState(officialId_front),
      idDocumentReverse: getValidationState(officialId_reverse),
      addressProof: getValidationState(addressProof)
    }

    if (income_proof_documents && Array.isArray(income_proof_documents)) {
      incomeProofs.value = income_proof_documents.map((doc: any): IncomeProof => ({
        id: doc.id || null,
        month: doc.month || null,
        type: doc.document_type || null,
        status: getValidationState(doc.status),
        sequence_number: doc.sequence_number || null
      }))
    } else {
      incomeProofs.value = []
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      $q.notify({
        type: 'warning',
        message: 'No se encontró información del cliente. Por favor, inicia sesión.'
      })
      router.push('/login')
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar los documentos. Por favor, intenta de nuevo.'
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.documents-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem 1rem;
  padding-bottom: 4rem;
}

.documents-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.client-name-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(38, 224, 133, 0.2);
}

.client-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.documents-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.documents-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.documents-card {
  max-width: 56rem;
  margin: 0 auto;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.progress-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.progress-text {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.documents-list {
  margin-bottom: 2rem;
}

.document-category {
  margin-bottom: 2rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
}

.document-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.document-item {
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.document-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.document-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  word-wrap: break-word;
}

.document-meta {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

.document-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.upload-toggle-btn {
  white-space: nowrap;
}

.upload-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.selected-file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #166534;
}

.upload-submit-btn {
  margin-top: 0.75rem;
  height: 2.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  border: none;
}

.upload-hint-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.add-proof-card {
  border: 2px dashed #d1d5db !important;
  background: #f9fafb;
}

.add-proof-btn {
  height: 3rem;
  font-weight: 600;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  border: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Uploader Styles */
.uploader-component {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.uploader-component:hover {
  border-color: #26e085;
  background-color: #f0fdf4;
}

.uploader-header {
  user-select: none;
  transition: background-color 0.2s ease;
}

.uploader-header:hover {
  background-color: rgba(38, 224, 133, 0.05);
}

.uploader-component .q-uploader__title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.uploader-component .q-uploader__subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Ensure file input is accessible */
.uploader-component input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

/* Responsive Styles */
@media (max-width: 640px) {
  .documents-container {
    padding: 1rem 0.75rem;
  }

  .documents-header {
    margin-bottom: 1.5rem;
    padding-top: 0.5rem;
  }

  .client-name-section {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .client-name {
    font-size: 1rem;
    text-align: center;
    flex-direction: column;
    gap: 0.25rem;
  }

  .documents-title {
    font-size: 1.75rem;
  }

  .documents-subtitle {
    font-size: 0.875rem;
  }

  .category-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category-title {
    font-size: 1rem;
  }

  .document-items {
    grid-template-columns: 1fr;
  }

  .document-item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .document-actions {
    width: 100%;
    justify-content: space-between;
  }

  .upload-section {
    width: 100%;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .document-items {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 1025px) {
  .document-items {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
