<template>
  <div 
    v-if="flowProcessStore.flowProcess === 'onCreditWeb'"
    class="process-stepper" 
    :style="{ top: stepperTopPosition + 'px', opacity: isPositioned ? 1 : 0 }"
  >
    <div class="stepper-content-wrapper">
      <div v-if="visibleSteps.length > 0" class="stepper-row">
        <div
          v-for="(step, index) in visibleSteps"
          :key="index"
          class="step-item"
        >
          <div v-if="index > 0" class="compact-connector" :class="{ 'is-completed': isStepCompleted(step) }"></div>
          
          <div
            :class="[
              'step-node',
              currentStep === step ? 'node-active' : 
              isStepCompleted(step) ? 'node-completed' : 'node-inactive'
            ]"
          >
            <div class="node-icon">
              <q-icon v-if="isStepCompleted(step)" name="check" size="14px" class="completed-check-icon" />
              <span v-else>{{ getStepNumber(step) }}</span>
            </div>

            <span v-if="currentStep === step" class="active-label">
              {{ getStepNameShort(step) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useFlowProcessStore } from "@/stores/flowProcessStore";
import { stepsDictionary } from "@/helpers/data";

const route = useRoute();
const flowProcessStore = useFlowProcessStore();

// Calculate position below MotorcyclePreview
const stepperTopPosition = ref(80); // Default navbar height
const isPositioned = ref(false) // Track if stepper is properly positioned

function updateStepperPosition() {
  if (typeof window === 'undefined') return
  
  // Position stepper below navbar (above MotorcyclePreview)
  const navbar = document.querySelector('.navbar-finva') as HTMLElement
  if (navbar) {
    const navbarRect = navbar.getBoundingClientRect()
    if (navbarRect.height > 0) {
      // Position stepper directly below navbar
      stepperTopPosition.value = navbarRect.bottom
      isPositioned.value = true
      return
    }
  }
  
  // Fallback: use default navbar height
  stepperTopPosition.value = 80
  isPositioned.value = true
}

// Get current step name based on route
const currentStep = computed(() => {
  const routeName = route.name as string;
  
  // Map personal-quote to client-validation step
  if (routeName === 'personal-quote') {
    return stepsDictionary["client-validation"] || "Identificación";
  }
  
  // Map id-validation and confirm-data to client-validation step (they're part of the identification flow)
  if (["id-validation", "curp-generator", "curp-validation", "confirm-data"].includes(routeName)) {
    return stepsDictionary["client-validation"] || "Identificación";
  }
  
  // Check if current route is one of our filtered steps
  if (filteredStepRoutes.includes(routeName)) {
    return stepsDictionary[routeName] || routeName;
  }
  
  // Also handle upload-documents as my-documents
  if (routeName === 'upload-documents') {
    return stepsDictionary['my-documents'] || stepsDictionary['upload-documents'] || 'Subir documentos';
  }
  
  return stepsDictionary[routeName] || routeName;
});

// Define the 4 specific steps to show
const filteredStepRoutes = ['quote-generator', 'client-validation', 'buro-credito-request', 'my-documents'];

// Get steps for the current flow process - only show the 4 filtered steps
const steps = computed(() => {
  // Map route names to step names, only including the 4 filtered steps
  const mappedSteps = filteredStepRoutes
    .map((routeName) => stepsDictionary[routeName] || routeName)
    .filter(Boolean);
  
  console.log('[ProcessStepper] Filtered steps:', mappedSteps);
  
  return mappedSteps;
});

const currentStepIndex = computed(() => {
  const index = steps.value.indexOf(currentStep.value);
  console.log('[ProcessStepper] Current route name:', route.name);
  console.log('[ProcessStepper] Current step name:', currentStep.value);
  console.log('[ProcessStepper] Current step index:', index);
  console.log('[ProcessStepper] Available steps:', steps.value);
  return index;
});

const visibleSteps = computed(() => {
  // Always show all 4 steps (no ellipsis needed for 4 steps)
  return steps.value;
});

const getStepNumber = (step: string | number): number => {
  if (step === "...") return 0;
  const index = steps.value.indexOf(step as string);
  return index >= 0 ? index + 1 : 0;
};

const getStepName = (step: string | number): string => {
  if (step === "...") return "...";
  return step as string;
};

// Get shorter step name for mobile/compact display
const getStepNameShort = (step: string | number): string => {
  if (step === "...") return "...";
  
  const stepName = step as string;
  
  // Map to shorter names
  const shortNames: Record<string, string> = {
    "Obtener Cotización": "Cotización",
    "Identificación": "Identificación",
    "Consulta BC": "BC",
    "Subir documentos": "Documentos"
  };
  
  return shortNames[stepName] || stepName;
};

const isStepCompleted = (step: string | number): boolean => {
  if (step === "...") return false;
  const stepIndex = steps.value.indexOf(step as string);
  return stepIndex >= 0 && stepIndex < currentStepIndex.value;
};

// Update position on mount and when needed
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Immediate positioning - no need to wait for MotorcyclePreview
    updateStepperPosition()
    
    // Update on resize
    requestAnimationFrame(() => {
      updateStepperPosition()
    })
    
    // Update on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updateStepperPosition)
    }
    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate)
    
    // Watch for navbar changes (in case it resizes)
    const navbar = document.querySelector('.navbar-finva')
    if (navbar) {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateStepperPosition)
      })
      resizeObserver.observe(navbar)
      
      onUnmounted(() => {
        resizeObserver.disconnect()
        window.removeEventListener('scroll', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
      })
    } else {
      onUnmounted(() => {
        window.removeEventListener('scroll', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
      })
    }
  }
})
</script>

<style scoped>
.process-stepper {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  /* Minimal height - compact line */
  padding: 0.25rem 0.75rem;
  min-height: auto; 
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  pointer-events: none;
  transition: opacity 0.2s ease;
  visibility: hidden;
}

.process-stepper[style*="opacity: 1"] {
  visibility: visible;
}

.stepper-content-wrapper {
  pointer-events: auto;
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 2rem;
}

.stepper-row {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
}

.step-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Slim Connector - Expanded */
.compact-connector {
  flex: 1;
  min-width: 40px;
  max-width: 200px;
  height: 1.5px;
  background: #f1f1f1;
  margin: 0 12px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.compact-connector.is-completed {
  background: #242424;
  box-shadow: 0 0 4px rgba(36, 36, 36, 0.3);
}

/* Base Node Styling with 3D effect */
.step-node {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 20px;
  padding: 0 6px;
  background: #f9f9f9;
  border: 1px solid #eeeeee;
  position: relative;
  /* 3D page effect */
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  transform-style: preserve-3d;
  min-width: auto;
  width: auto;
  flex-shrink: 0;
  overflow: visible;
}

.step-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 100%);
  pointer-events: none;
  z-index: 1;
}

.node-icon {
  font-size: 0.65rem;
  font-weight: 800;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

/* Active Pill - Using black (#242424) */
.node-active {
  border-color: #242424;
  background: #242424;
  padding: 0 10px;
  transform: scale(1.12);
  box-shadow: 0 3px 10px rgba(36, 36, 36, 0.3);
  position: relative;
  z-index: 10;
  min-width: auto;
  width: auto;
  flex-shrink: 0;
  overflow: visible;
}

.node-active::before {
  background: rgba(36, 36, 36, 0.1);
  transform: scale(1.5);
}

.node-active .node-icon,
.node-active .active-label {
  color: #ffffff;
}

.active-label {
  font-size: 0.65rem;
  font-weight: 700;
  margin-left: 4px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  overflow: visible;
  text-overflow: clip;
}

/* Completed Node with white check icon */
.node-completed {
  background: #242424;
  border-color: #242424;
  width: 20px;
  padding: 0;
  box-shadow: 0 3px 10px rgba(36, 36, 36, 0.3);
  transform: translateY(-0.5px);
}

.node-completed::before {
  background: rgba(36, 36, 36, 0.1);
  transform: scale(1.5);
}

.node-completed .node-icon {
  color: white;
}

.completed-check-icon {
  color: white !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  font-weight: bold;
}

/* Inactive Node with subtle 3D */
.node-inactive {
  background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
  border-color: #e5e7eb;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
}

.node-inactive::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(0, 0, 0, 0.02) 100%);
}

.node-ellipsis {
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
}

.node-ellipsis::before {
  display: none;
}

/* Mobile Optimization - Show same progress bar but more compact */
@media (max-width: 600px) {
  .process-stepper {
    padding: 0.2rem 0.5rem;
    height: 28px;
  }
  
  .stepper-content-wrapper {
    max-width: 100%;
    padding: 0 0.5rem;
  }
  
  .stepper-row {
    gap: 0;
    max-width: 100%;
  }
  
  .compact-connector {
    flex: 1;
    max-width: 60px;
    margin: 0 4px;
    height: 1px;
  }
  
  .step-node {
    height: 18px;
    padding: 0 4px;
    border-radius: 12px;
  }
  
  .node-active {
    padding: 0 6px;
    transform: translateY(-0.5px) scale(1.02);
  }
  
  .node-completed {
    width: 18px;
  }
  
  .node-icon {
    font-size: 0.6rem;
  }
  
  .active-label {
    font-size: 0.6rem;
    margin-left: 3px;
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }
  
  .node-active {
    padding: 0 8px;
    overflow: visible;
  }
}
</style>

