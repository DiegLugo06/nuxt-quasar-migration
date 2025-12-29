<template>
  <ClientOnly>
    <q-form
      @submit="handleSubmit"
      class="flex flex-col space-y-6 md:px-12"
    >
      <!-- Title -->
      <div class="text-xl font-semibold text-center mt-10 mx-12">
        {{ title }}
      </div>
      <!-- Reusable Input Fields -->
      <template v-for="(field, index) in fields" :key="index">
        <template v-if="field.title">
          <label class="text-lg font-semibold text-center mx-5">
            {{ field.title }}</label
          >
        </template>
        <template v-if="field.subTitle">
          <label class="text-sm text-gray-500 text-center">
            {{ field.subTitle }}</label
          >
        </template>
        <!-- Regular text/email inputs -->
        <template
          v-if="
            field.type === 'text' ||
            field.type === 'email' ||
            field.type === 'number' ||
            field.type == 'tel'
          "
        >
          <q-input
            v-model="form[field.model]"
            :label="field.label"
            :type="field.type"
            :rules="field.rules"
            :disable="field.disable"
            :maxlength="field.maxlength"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
            <template v-if="field.appendIcon" v-slot:append>
              <q-icon
                :name="field.appendIcon"
                class="cursor-pointer"
                @click="field.onAppendClick?.()"
              />
            </template>
            <template v-if="field.tooltip" v-slot:append>
              <q-icon name="info" class="cursor-pointer">
                <q-tooltip>
                  {{ field.tooltip }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </template>

        <!-- Select inputs -->
        <template v-else-if="field.type === 'select' && field.mapped">
          <q-select
            v-model="form[field.model]"
            :label="field.label"
            :options="field.options"
            class="custom-input"
            emit-value
            map-options
            :multiple="field.multiple"
            :hint="field.hint || ''"
            :hide-hint="true"
            :disable="field.disable"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
            <template v-if="field.tooltip" v-slot:append>
              <q-icon name="info" class="cursor-pointer">
                <q-tooltip>
                  {{ field.tooltip }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-select>
        </template>

        <template v-else-if="field.type === 'select' && !field.mapped">
          <q-select
            v-model="form[field.model]"
            :label="field.label"
            :options="field.options"
            :multiple="field.multiple"
            class="custom-input mobile-label"
            :hint="field.hint || ''"
            :hide-hint="true"
            :disable="field.disable"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
            <template v-if="field.tooltip" v-slot:append>
              <q-icon name="info" class="cursor-pointer">
                <q-tooltip>
                  {{ field.tooltip }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-select>
        </template>

        <!-- Date inputs -->
        <template v-else-if="field.type === 'date'">
          <q-input
            v-model="form[field.model]"
            :label="field.label"
            :rules="field.rules"
            :disable="field.disable"
            class="custom-input"
            type="date"
          >
            <template v-slot:prepend>
              <q-icon :name="field.icon" />
            </template>
          </q-input>
        </template>

        <template v-else-if="field.type === 'radio'">
          <div class="flex flex-col justify-center space-y-2 mx-12">
            <!-- Label with Icon -->
            <div class="text-lg text-center">
              <q-icon :name="field.icon" size="25px" />
              <span class="ml-2">{{ field.label }}</span>
            </div>

            <!-- Radio Buttons Row -->
            <div class="flex flex-nowrap justify-center">
              <div
                v-for="option in field.options"
                :key="option.value"
                class="flex items-center"
              >
                <q-radio
                  :model-value="form[field.model] !== undefined ? form[field.model] : null"
                  @update:model-value="(val) => { 
                    console.log('[ReusableForm] q-radio update event for', field.model, 'new value:', val);
                    if (form && field.model) {
                      form[field.model] = val;
                    }
                  }"
                  :val="option.value"
                  :label="option.label"
                  :checked-icon="field.checkedIcon || 'task_alt'"
                  :unchecked-icon="field.uncheckedIcon || 'panorama_fish_eye'"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Predefined Inputs (Phone) -->
        <template v-else-if="field.predefined === 'phone'">
          <q-input
            v-model="phoneComputed"
            label="Celular"
            :rules="[
              (val) => !!val || 'El celular es obligatorio',
              (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
            ]"
            class="custom-input"
            mask="(##) #### ####"
            :disable="field.disable"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </template>
        <!-- Predefined Inputs (Curp) -->
        <template v-else-if="field.predefined === 'curp'">
          <q-input
            v-model="curpComputed"
            label="CURP"
            :rules="[
              (val) => !!val || 'El curp es obligatiorio',
              (val) => val.length === 18 || 'El curp debe contener 18 dígitos',
            ]"
            maxlength="18"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </template>
        <!-- Predefined Inputs (Street Address) -->
        <template v-else-if="field.predefined === 'streetAddress'">
          <q-input
            v-model="streetAddressComputed"
            label="Calle"
            :rules="[
              (val) => !!val || 'El nombre de la calle es obligatorio',
              (val) =>
                /^[a-zA-Z0-9\s]*$/.test(val) ||
                'No se permiten acentos o caracteres que no sean alfanuméricos',
            ]"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>

          <q-input
            v-model="numberAddressComputed"
            label="Número Exterior"
            :rules="[
              (val) => !!val || 'Número es obligatorio',
              (val) =>
                /^[a-zA-Z0-9\s]*$/.test(val) ||
                'No se permiten acentos o caracteres que no sean alfanuméricos',
            ]"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="pin_drop" />
            </template>
          </q-input>
        </template>
        <!-- Predefined Inputs (Neighborhoods) -->
        <template v-else-if="field.predefined === 'neighborhoods' && form">
          <q-input
            v-model="form.zip_code"
            label="Código postal"
            :rules="[
              (val) => !!val || 'El código postal es obligatorio',
              (val) => val.length === 5 || 'Debe ser un número de 5 dígitos',
            ]"
            class="custom-input"
            mask="#####"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="markunread_mailbox" />
            </template>
          </q-input>
          <q-select
            v-if="hasNeighborhoods"
            v-model="form.suburb_colonia"
            label="Colonia"
            :options="neighborhoodsOptions"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-select>

          <q-input
            v-else
            v-model="form.suburb_colonia"
            label="Colonia"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'timeLivingThere'">
          <div
            class="flex flex-col text-center"
            style="padding-left: 1.75rem; padding-right: 1.75rem"
          >
            <label class="text-lg font-semibold mb-1"
              >Tiempo viviendo ahí</label
            >
            <label class="text-sm text-gray-500 mb-1"
              >Si no recuerda con exactitud poner un aproximado</label
            >
            <div class="flex flex-nowrap space-x-1 justify-center">
              <q-input
                v-model="timeLivingYearsComputed"
                label="Años"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
              <q-input
                v-model="timeLivingMonthsComputed"
                label="Meses"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                  (val) => val < 12 || '12 meses es un año',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>
          </div>
        </template>
        <template v-else-if="field.predefined === 'monthlyIncome'">
          <q-input
            v-model="formattedMonthlyIncome"
            label="¿Cuál es tu ingreso bruto mensual?"
            type="text"
            class="custom-input"
            :rules="[
              (val) => !!val || 'Estimación de ingreso mensual es obligatoria',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="money" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'debtPayFromIncome'">
          <q-input
            v-model="formattedMonthlyDebtPay"
            label="Pago de deudas mensualmente"
            type="text"
            class="custom-input"
            :rules="[
              (val) =>
                (val !== '' && val !== null && val !== undefined) ||
                'Estimación de ingreso mensual es obligatoria',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="money" />
            </template>
            <template v-slot:append>
              <q-icon name="info" class="cursor-pointer">
                <q-tooltip>
                  De tu ingreso mensual, ¿Cuánto destinas a pagar deudas?
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'timeCurrenJob'">
          <div
            class="flex flex-col text-center justify-center items-center"
            style="padding-left: 1.75rem; padding-right: 1.75rem"
          >
            <label class="text-lg font-semibold mb-1"
              >Detalles del empleo actual</label
            >
            <label class="text-sm text-gray-500 mb-1"
              ><b>Tiempo en empleo</b> <br />
              Si no recuerda con exactitud poner un aproximado</label
            >
            <div
              class="flex flex-nowrap space-x-1 justify-center items-center max-w-72"
            >
              <q-input
                v-model="timeCurrentJobYearsComputed"
                label="Años"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
              <q-input
                v-model="timeCurrentJobMonthsComputed"
                label="Meses"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                  (val) => val < 12 || '12 meses es un año',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>
          </div>
        </template>
        <template v-else-if="field.predefined === 'streetJobAddress'">
          <q-input
            v-model="streetJobAddressComputed"
            label="Calle"
            :rules="[
              (val) => !!val || 'El nombre de la calle es obligatorio',
              (val) =>
                /^[a-zA-Z0-9\s]*$/.test(val) ||
                'No se permiten acentos o caracteres que no sean alfanuméricos',
            ]"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>

          <q-input
            v-model="numberJobAddressComputed"
            label="Número exterior"
            :rules="[
              (val) => !!val || 'Número es obligatorio',
              (val) =>
                /^[a-zA-Z0-9\s]*$/.test(val) ||
                'No se permiten acentos o caracteres que no sean alfanuméricos',
            ]"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="pin_drop" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'neighborhoodsJob'">
          <q-input
            v-model="solicitud.current_job_zip_code"
            label="Código postal"
            :rules="[
              (val) => !!val || 'El código postal es obligatorio',
              (val) => val.length === 5 || 'Debe ser un número de 5 dígitos',
            ]"
            class="custom-input"
            mask="#####"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="markunread_mailbox" />
            </template>
          </q-input>

          <q-select
            v-if="neighborhoodsJobFromZipCode.length > 0"
            v-model="solicitud.current_job_suburb_colonia"
            label="Colonia"
            :options="neighborhoodsJobFromZipCode"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-select>

          <q-input
            v-else
            v-model="solicitud.current_job_suburb_colonia"
            label="Colonia"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'jobPhone'">
          <q-input
            v-model="jobPhoneComputed"
            label="Telefono del trabajo"
            :rules="[
              (val) => !!val || 'El celular es obligatorio',
              (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
            ]"
            class="custom-input"
            mask="(##) #### ####"
            :disable="field.disable"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </template>
        <template
          v-else-if="
            field.predefined == 'lastJob' && validationTimeCurrentJobComputed
          "
        >
          <div
            class="flex flex-col text-center justify-center items-center"
            style="padding-left: 1.75rem; padding-right: 1.75rem"
          >
            <label class="text-lg font-semibold mb-1"
              >Detalles del empleo anterior</label
            >
            <label class="text-sm text-gray-500 mb-1"
              ><b>Tiempo en empleo</b> <br />
              Si no recuerda con exactitud poner un aproximado</label
            >
            <div
              class="flex flex-nowrap space-x-1 justify-center items-center max-w-72"
            >
              <q-input
                v-model="timeLastJobYearsComputed"
                label="Años"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
              <q-input
                v-model="timeLastJobMonthsComputed"
                label="Meses"
                maxlength="2"
                style="font-size: 16px"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) ||
                    'Campo obligatorio',
                  (val) => val < 12 || '12 meses es un año',
                ]"
                type="tel"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>
          </div>

          <q-input
            v-model="solicitud.name_last_job"
            label="Nombre del último empleo"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="work_outline" />
            </template>
          </q-input>

          <q-input
            v-model="lastJobPhoneComputed"
            label="Telefono del trabajo"
            :rules="[
              (val) => !!val || 'El celular es obligatorio',
              (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
            ]"
            class="custom-input"
            mask="(##) #### ####"
            :disable="field.disable"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'famReferencePhone'">
          <q-input
            v-model="famReferencePhoneComputed"
            label="Celular"
            :rules="[
              (val) => !!val || 'El celular es obligatorio',
              (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
            ]"
            class="custom-input"
            mask="(##) #### ####"
            :disable="field.disable"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'neighborhoodsFamReference'">
          <q-input
            v-model="solicitud.fam_reference_zip_code"
            label="Código postal"
            :rules="[
              (val) => !!val || 'El código postal es obligatorio',
              (val) => val.length === 5 || 'Debe ser un número de 5 dígitos',
            ]"
            class="custom-input"
            mask="#####"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="markunread_mailbox" />
            </template>
          </q-input>

          <q-select
            v-if="neighborhoodsFamReferenceFromZipCode.length > 0"
            v-model="solicitud.fam_reference_suburb_colonia"
            label="Colonia"
            :options="neighborhoodsFamReferenceFromZipCode"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-select>

          <q-input
            v-else
            v-model="solicitud.fam_reference_suburb_colonia"
            label="Colonia"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'motorcycleForm'">
          <q-select
            v-model="solicitud.model_motorcycle"
            label="Modelo"
            :options="modelsByBrand(solicitud.brand_motorcycle)"
            class="custom-input"
            :disable="
              (!!motorcycleStore.hasDiscount &&
                !['cashWeb', 'onCreditWeb'].includes(
                  flowProcessStore.flowProcess
                )) ||
              !solicitud.brand_motorcycle
            "
          >
            <template v-slot:prepend>
              <q-icon name="two_wheeler" />
            </template>
          </q-select>

          <q-select
            v-model="solicitud.year_motorcycle"
            label="Año"
            :options="yearsByModel(solicitud.model_motorcycle)"
            class="custom-input"
            :disable="
              (!!motorcycleStore.hasDiscount &&
                !['cashWeb', 'onCreditWeb'].includes(
                  flowProcessStore.flowProcess
                )) ||
              !solicitud.model_motorcycle
            "
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-select>

          <q-input
            v-if="
              !['creditCard', 'cashWeb', 'onCreditWeb'].includes(
                flowProcessStore.flowProcess
              )
            "
            v-model="downPaymentComputed"
            label="Enganche ($)"
            class="custom-input"
            type="text"
            :rules="[
              (val) => !!val || 'El enganche es obligatorio',
              (val) =>
                (solicitud.percentage_down_payment || 0) < 1 ||
                'El enganche debe ser menor al precio de la moto',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>
          <div class="grid grid-cols-1 gap-6 mx-5">
            <div class="text-center p-4 bg-gray-100 rounded-lg">
              <label class="block text-lg font-semibold text-gray-700 mb-2">
                {{
                  "Valor total" +
                  (motorcycleStore.hasDiscount ? " con descuento" : "")
                }}
              </label>
              <p class="text-2xl font-bold text-gray-800">
                ${{ motorcyclePriceComputed }}
              </p>
            </div>
            <div
              v-if="
                !['cashWeb', 'onCreditWeb', 'creditCard'].includes(
                  flowProcessStore.flowProcess
                )
              "
              class="text-center p-4 bg-gray-100 rounded-lg"
            >
              <label class="block text-lg font-semibold text-gray-700 mb-2"
                >Enganche</label
              >
              <div class="flex nowrap justify-center space-x-4">
                <p class="text-2xl font-bold text-gray-800">
                  {{ downPaymentValueComputed }} %
                </p>
                <p class="text-2xl font-bold text-gray-800">
                  ${{ formatCurrencyValidated(downPaymentComputed) || "0.00" }}
                </p>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="field.predefined === 'friendReferencePhone'">
          <q-input
            v-model="friendReferencePhoneComputed"
            label="Celular"
            :rules="[
              (val) => !!val || 'El celular es obligatorio',
              (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
            ]"
            class="custom-input"
            mask="(##) #### ####"
            :disable="field.disable"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'friendReferenceTimeKnowing'">
          <q-input
            v-model="friendReferenceYearsKnowing"
            label="Tiempo de conocerse (Años)"
            maxlength="2"
            class="custom-input"
            :rules="[
              (val) =>
                (val !== '' && val !== null && val !== undefined) ||
                'Campo obligatorio',
            ]"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="hourglass_empty" />
            </template>
          </q-input>
        </template>
        <template
          v-else-if="field.predefined === 'neighborhoodsFriendReference'"
        >
          <q-input
            v-model="solicitud.friend_reference_zip_code"
            label="Código postal"
            :rules="[
              (val) => !!val || 'El código postal es obligatorio',
              (val) => val.length === 5 || 'Debe ser un número de 5 dígitos',
            ]"
            class="custom-input"
            mask="#####"
            type="tel"
          >
            <template v-slot:prepend>
              <q-icon name="markunread_mailbox" />
            </template>
          </q-input>

          <q-select
            v-if="neighborhoodsFriendReferenceFromZipCode.length > 0"
            v-model="solicitud.friend_reference_suburb_colonia"
            label="Colonia"
            :options="neighborhoodsFriendReferenceFromZipCode"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-select>

          <q-input
            v-else
            v-model="solicitud.friend_reference_suburb_colonia"
            label="Colonia"
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>
        </template>
        <template v-else-if="field.predefined === 'incomeSourceType'">
          <q-select
            v-model="incomeSourceTypeComputed"
            label="¿Cómo percibes tu ingreso?"
            :rules="[(val) => !!val || 'Este campo es obligatorio']"
            class="custom-input"
            :options="incomeSourceTypesMapped"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="receipt" />
            </template>
          </q-select>
        </template>
        <template v-else-if="field.predefined === 'incomeProof'">
          <q-select
            v-model="incomeProofComputed"
            label="¿Cómo compruebas tu ingreso?"
            :rules="[(val) => !!val || 'Este campo es obligatorio']"
            class="custom-input"
            :options="incomeProofOptions"
          >
            <template v-slot:prepend>
              <q-icon name="receipt" />
            </template>
          </q-select>
        </template>
        <template v-else-if="field.predefined === 'bankQuotes'">
          <BankQuotes :quotes="bankQuotes" title="Opciones de financiamiento" />
        </template>
      </template>

      <!-- Submit Button -->
      <div
        class="flex flex justify-around no-wrap space-x-1 justify-center items-center"
      >
        <q-btn
          v-if="previousStep"
          :label="backButtonLabel"
          :color="backButtonColor"
          :icon="backButtonIcon"
          @click="router.push({ name: previousStep })"
          class="rounded-full"
          :class="{ 'text-xs': isMobileScreen, 'text-md': !isMobileScreen }"
        />
        <q-btn
          :label="submitButtonLabel"
          type="submit"
          :color="submitButtonColor"
          :icon="submitButtonIcon"
          class="rounded-full"
          :class="{ 'text-xs': isMobileScreen, 'text-md': !isMobileScreen }"
        />
      </div>
    </q-form>
  </ClientOnly>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, nextTick, onErrorCaptured } from "vue";
import { QSpinnerHourglass, useQuasar } from "quasar";
import {
  formatCurrencyValidated,
  parseCurrency,
} from "~/helpers/formatFunctions";
import { incomeProofOptions, incomeSourceTypesMapped } from "~/helpers/data";

console.log('[ReusableForm] Imports loaded');
console.log('[ReusableForm] useQuasar imported:', typeof useQuasar);

console.log('[ReusableForm] Initializing stores...');
const clientStore = useClientStore();
console.log('[ReusableForm] clientStore initialized:', !!clientStore);
console.log('[ReusableForm] clientStore type:', typeof clientStore);
console.log('[ReusableForm] clientStore.neighborhoods exists:', 'neighborhoods' in (clientStore || {}));
console.log('[ReusableForm] clientStore.neighborhoods value:', clientStore?.neighborhoods);
console.log('[ReusableForm] clientStore.neighborhoods type:', typeof clientStore?.neighborhoods);

const solicitudStore = useSolicitudStore();
const motorcycleStore = useMotorcycleStore();
const flowProcessStore = useFlowProcessStore();
console.log('[ReusableForm] Initializing Quasar...');
const $q = useQuasar();
console.log('[ReusableForm] $q initialized:', !!$q);
console.log('[ReusableForm] $q type:', typeof $q);
console.log('[ReusableForm] $q.screen exists:', $q?.screen ? 'yes' : 'no');
console.log('[ReusableForm] $q.screen type:', typeof $q?.screen);
console.log('[ReusableForm] $q.screen.xs exists:', $q?.screen?.xs !== undefined);
console.log('[ReusableForm] $q.screen.xs value:', $q?.screen?.xs);

const router = useRouter();
const route = useRoute();
const { getPreviousAndNextStep } = flowProcessStore;

const pageName = [
  "id-validation",
  "curp-generator",
  "curp-validation",
].includes(route.name)
  ? "client-validation"
  : route.name;
const { previousStep, nextStep } = getPreviousAndNextStep(pageName);
const { client, getNeighborhoods } = clientStore;
const { solicitud } = solicitudStore;

// Safety checks: ensure stores and properties exist
console.log('[ReusableForm] Running safety checks...');
console.log('[ReusableForm] clientStore check:', !!clientStore);
console.log('[ReusableForm] clientStore.neighborhoods before check:', clientStore?.neighborhoods);

if (!clientStore) {
  console.error('[ReusableForm] ERROR: clientStore is undefined!');
} else {
  console.log('[ReusableForm] clientStore exists, checking neighborhoods...');
  console.log('[ReusableForm] clientStore.neighborhoods:', clientStore.neighborhoods);
  console.log('[ReusableForm] clientStore.neighborhoods === undefined:', clientStore.neighborhoods === undefined);
  console.log('[ReusableForm] clientStore.neighborhoods === null:', clientStore.neighborhoods === null);
  
  // Ensure neighborhoods array exists
  if (!clientStore.neighborhoods) {
    console.warn('[ReusableForm] clientStore.neighborhoods is undefined/null, initializing to []');
    clientStore.neighborhoods = [];
  } else {
    console.log('[ReusableForm] clientStore.neighborhoods is already defined:', clientStore.neighborhoods);
  }
  console.log('[ReusableForm] clientStore.neighborhoods after initialization:', clientStore.neighborhoods);
}

if (!client) {
  console.warn('[ReusableForm] Client is undefined, this may cause errors');
} else {
  console.log('[ReusableForm] Client exists:', !!client);
}

const formStreet = reactive({
  street: "",
  number: "",
});
const neighborhoodsFromZipCode = ref([]);
const neighborhoodsJobFromZipCode = ref([]);
const neighborhoodsFamReferenceFromZipCode = ref([]);
const neighborhoodsFriendReferenceFromZipCode = ref([]);
const modelsByBrand = (brand) => motorcycleStore.modelsByBrand?.(brand) || [];
const yearsByModel = (model) => motorcycleStore.yearsByModel?.(model) || [];

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  submitButtonLabel: {
    type: String,
    default: "Submit",
  },
  submitButtonColor: {
    type: String,
    default: "primary",
  },
  submitButtonIcon: {
    type: String,
    default: "save",
  },
  onSubmit: {
    type: Function,
    required: true,
  },
  backButtonLabel: {
    type: String,
    default: "Regresar",
  },
  backButtonColor: {
    type: String,
    default: "primary",
  },
  backButtonIcon: {
    type: String,
    default: "arrow_back",
  },
  bankQuotes: {
    type: Array,
    default: [],
  },
});

// Helper function for loading state
const showLoading = (message) => {
  $q.loading.show({
    message: `${message} <br><br><b>¡¡¡Por favor no cierres ni actualices la página!!!</b>`,
    html: true,
    spinner: QSpinnerHourglass,
    spinnerColor: "white",
    backgroundColor: "primary",
    customClass: "custom-loading",
  });
};

const hideLoading = () => {
  $q.loading.hide();
};

const emit = defineEmits(["submit"]);

// Error handler to catch component errors
onErrorCaptured((err, instance, info) => {
  console.error('[ReusableForm] Error captured:', err);
  console.error('[ReusableForm] Error info:', info);
  console.error('[ReusableForm] Error message:', err?.message);
  console.error('[ReusableForm] Error stack:', err?.stack);
  if (err?.message?.includes('_withMods')) {
    console.error('[ReusableForm] _withMods error detected!');
    console.error('[ReusableForm] Form at error time:', props.form);
    console.error('[ReusableForm] Fields at error time:', props.fields);
  }
  return false; // Don't prevent error propagation
});

console.log('[ReusableForm] Component setup started');
console.log('[ReusableForm] Props form:', props.form);
console.log('[ReusableForm] Props fields:', props.fields);
console.log('[ReusableForm] Process client:', process.client);

// Helper functions to safely get/set radio values to prevent _withMods errors
const getRadioValue = (model) => {
  try {
    console.log('[ReusableForm] getRadioValue called for model:', model);
    console.log('[ReusableForm] Form exists:', !!props.form);
    console.log('[ReusableForm] Form type:', typeof props.form);
    console.log('[ReusableForm] Model in form:', model in (props.form || {}));
    
    if (!props.form) {
      console.warn('[ReusableForm] getRadioValue: form is null/undefined, returning null');
      return null
    }
    
    if (!(model in props.form)) {
      console.warn('[ReusableForm] getRadioValue: model', model, 'not in form, returning null');
      return null
    }
    
    const value = props.form[model]
    console.log('[ReusableForm] getRadioValue: raw value:', value, 'Type:', typeof value);
    const result = value === undefined ? null : value
    console.log('[ReusableForm] getRadioValue: returning:', result);
    return result
  } catch (error) {
    console.error('[ReusableForm] Error in getRadioValue:', error);
    console.error('[ReusableForm] Error stack:', error?.stack);
    return null
  }
}

const setRadioValue = (model, value) => {
  console.log('[ReusableForm] setRadioValue called for model:', model, 'value:', value);
  if (props.form && model) {
    props.form[model] = value
    console.log('[ReusableForm] setRadioValue: value set to form[', model, ']:', props.form[model]);
  } else {
    console.warn('[ReusableForm] setRadioValue: form or model not available');
  }
}

// Initialize form model values for radio fields immediately to prevent _withMods errors
// This must happen synchronously before the template renders
console.log('[ReusableForm] Initializing radio field values...');
props.fields.forEach((field) => {
  if (field.type === 'radio' && field.model) {
    console.log('[ReusableForm] Processing radio field:', field.model);
    console.log('[ReusableForm] Field model in form:', field.model in (props.form || {}));
    console.log('[ReusableForm] Current value:', props.form?.[field.model], 'Type:', typeof props.form?.[field.model]);
    
    // Ensure the form model has a value (even if null) to prevent Quasar errors
    if (!(field.model in props.form) || props.form[field.model] === undefined) {
      console.log('[ReusableForm] Setting', field.model, 'to null (was undefined)');
      // Directly set the value - Vue's reactivity will handle it
      props.form[field.model] = null
    } else {
      console.log('[ReusableForm] Field', field.model, 'already has value:', props.form[field.model]);
    }
  }
})
console.log('[ReusableForm] Radio field initialization completed');

const handleSubmit = (event) => {
  // Prevent default form submission manually to avoid withModifiers error
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  submitForm();
};

const submitForm = async () => {
  const onSubmitFunction = await props.onSubmit();
  if (nextStep && onSubmitFunction == "proceed")
    router.push({ name: nextStep });
};

const phoneComputed = computed({
  get() {
    const form = props.form || client;
    if (!form?.phone) return "";
    return form.phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    const form = props.form || client;
    if (form) {
      form.phone = `+52${value.replace(/\D/g, "")}`;
    }
  },
});

const curpComputed = computed({
  get: () => {
    const form = props.form || client;
    return (form?.curp || "").toUpperCase();
  },
  set: (value) => {
    const form = props.form || client;
    if (form) {
      form.curp = value.toUpperCase();
    }
  },
});

// Computed property for time_living_years
const timeLivingYearsComputed = computed({
  get: () => {
    const form = props.form || client;
    return parseInt(form?.time_living_there?.split(" ")[0]) || 0;
  },
  set: (value) => {
    const form = props.form || client;
    if (form) {
      form.time_living_there = `${parseInt(value) || 0} years ${
        form.time_living_there?.split(" ")[2] || 0
      } months`;
    }
  },
});

// Computed property for time_living_months
const timeLivingMonthsComputed = computed({
  get: () => {
    const form = props.form || client;
    return parseInt(form?.time_living_there?.split(" ")[2]) || 0;
  },
  set: (value) => {
    const form = props.form || client;
    if (form) {
      form.time_living_there = `${
        form.time_living_there?.split(" ")[0] || 0
      } years ${parseInt(value) || 0} months`;
    }
  },
});

const streetAddressComputed = computed({
  get: () => {
    const form = props.form || client;
    return form?.street_address?.split(" ").slice(0, -1).join(" ") || "";
  },
  set: (value) => {
    const form = props.form || client;
    if (form) {
      form.street_address = `${value} ${form.street_address
        ?.split(" ")
        .pop() || ""}`;
    }
  },
});

const numberAddressComputed = computed({
  get: () => {
    const form = props.form || client;
    return form?.street_address?.split(" ").pop() || "";
  },
  set: (value) => {
    const form = props.form || client;
    if (form) {
      form.street_address = `${form.street_address
        ?.split(" ")
        .slice(0, -1)
        .join(" ")} ${value}`;
    }
  },
});

// Computed property for formatted value
const formattedMonthlyIncome = computed({
  get() {
    return solicitud.monthly_income
      ? formatCurrencyValidated(solicitud.monthly_income)
      : 0;
  },
  set(value) {
    solicitud.monthly_income = parseCurrency(value);
  },
});

// Computed property for formatted value
const formattedMonthlyDebtPay = computed({
  get() {
    return solicitud.debt_pay_from_income
      ? formatCurrencyValidated(solicitud.debt_pay_from_income)
      : 0;
  },
  set(value) {
    solicitud.debt_pay_from_income = parseCurrency(value);
  },
});

// Computed property for time_current_job years
const timeCurrentJobYearsComputed = computed({
  get: () => parseInt(solicitud.time_current_job?.split(" ")[0]) || 0,
  set: (value) =>
    (solicitud.time_current_job = `${parseInt(value) || 0} years ${
      solicitud.time_current_job?.split(" ")[2] || 0
    } months`),
});

// Computed property for time_current_job months
const timeCurrentJobMonthsComputed = computed({
  get: () => parseInt(solicitud.time_current_job?.split(" ")[2]) || 0,
  set: (value) =>
    (solicitud.time_current_job = `${
      solicitud.time_current_job?.split(" ")[0] || 0
    } years ${parseInt(value) || 0} months`),
});

const streetJobAddressComputed = computed({
  get: () =>
    solicitud.current_job_street_address?.split(" ").slice(0, -1).join(" ") || "",
  set: (value) =>
    (solicitud.current_job_street_address = `${value} ${solicitud.current_job_street_address
      ?.split(" ")
      .pop() || ""}`),
});

const numberJobAddressComputed = computed({
  get: () => solicitud.current_job_street_address?.split(" ").pop() || "",
  set: (value) =>
    (solicitud.current_job_street_address = `${solicitud.current_job_street_address
      ?.split(" ")
      .slice(0, -1)
      .join(" ")} ${value}`),
});

const jobPhoneComputed = computed({
  get() {
    if (!solicitud.current_job_phone) return "";
    return solicitud.current_job_phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    solicitud.current_job_phone = `+52${value.replace(/\D/g, "")}`;
  },
});

// Computed property for time_last_job years
const timeLastJobYearsComputed = computed({
  get: () => parseInt(solicitud.time_last_job?.split(" ")[0]) || 0,
  set: (value) =>
    (solicitud.time_last_job = `${parseInt(value) || 0} years ${
      solicitud.time_last_job?.split(" ")[2] || 0
    } months`),
});

// Computed property for time_last_job months
const timeLastJobMonthsComputed = computed({
  get: () => parseInt(solicitud.time_last_job?.split(" ")[2]) || 0,
  set: (value) =>
    (solicitud.time_last_job = `${
      solicitud.time_last_job?.split(" ")[0] || 0
    } years ${parseInt(value) || 0} months`),
});

const lastJobPhoneComputed = computed({
  get() {
    if (!solicitud.last_job_phone) return "";
    return solicitud.last_job_phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    solicitud.last_job_phone = `+52${value.replace(/\D/g, "")}`;
  },
});

const famReferencePhoneComputed = computed({
  get() {
    if (!solicitud.fam_reference_phone) return "";
    return solicitud.fam_reference_phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    solicitud.fam_reference_phone = `+52${value.replace(/\D/g, "")}`;
  },
});

const motorcyclePriceComputed = computed(() => {
  return formatCurrencyValidated(solicitud.invoice_motorcycle_value) || "0.00";
});

const downPaymentComputed = computed({
  get() {
    return solicitud.percentage_down_payment && solicitud.invoice_motorcycle_value
      ? formatCurrencyValidated(
          solicitud.percentage_down_payment * solicitud.invoice_motorcycle_value
        )
      : 0.0;
  },
  set(value) {
    solicitud.percentage_down_payment = solicitud.invoice_motorcycle_value
      ? parseCurrency(value) / solicitud.invoice_motorcycle_value
      : 0;
  },
});

const downPaymentValueComputed = computed(() => {
  return solicitud.percentage_down_payment
    ? (solicitud.percentage_down_payment * 100).toFixed(2)
    : "0.00";
});

const friendReferencePhoneComputed = computed({
  get() {
    if (!solicitud.friend_reference_phone) return "";
    return solicitud.friend_reference_phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    solicitud.friend_reference_phone = `+52${value.replace(/\D/g, "")}`;
  },
});

const friendReferenceYearsKnowing = computed({
  get: () =>
    parseInt(solicitud.friend_reference_time_knowing?.split(" ")[0]) || 0,
  set: (value) => (solicitud.friend_reference_time_knowing = `${value} years`),
});

const validationTimeCurrentJobComputed = computed(() => {
  return solicitud.time_current_job?.split(" ")[0] == 0;
});

const incomeSourceTypeComputed = computed({
  get: () => (solicitud.income_source_type && solicitud.income_source_type.length > 0) ? solicitud.income_source_type[0] : null,
  set: (value) => (solicitud.income_source_type = [value]),
});

const incomeProofComputed = computed({
  get: () => (solicitud.income_proof && solicitud.income_proof.length > 0) ? solicitud.income_proof[0] : null,
  set: (value) => (solicitud.income_proof = [value]),
});

// Computed properties for neighborhoods to prevent undefined errors
const hasNeighborhoods = computed(() => {
  console.log('[ReusableForm] hasNeighborhoods computed - checking...');
  console.log('[ReusableForm] clientStore exists:', !!clientStore);
  if (!clientStore) {
    console.warn('[ReusableForm] clientStore is undefined in hasNeighborhoods computed');
    return false;
  }
  console.log('[ReusableForm] clientStore.neighborhoods:', clientStore.neighborhoods);
  console.log('[ReusableForm] clientStore.neighborhoods type:', typeof clientStore.neighborhoods);
  const has = clientStore.neighborhoods && Array.isArray(clientStore.neighborhoods) && clientStore.neighborhoods.length > 0;
  console.log('[ReusableForm] hasNeighborhoods result:', has);
  return has;
});

const neighborhoodsOptions = computed(() => {
  console.log('[ReusableForm] neighborhoodsOptions computed - getting options...');
  console.log('[ReusableForm] clientStore exists:', !!clientStore);
  if (!clientStore) {
    console.warn('[ReusableForm] clientStore is undefined in neighborhoodsOptions computed');
    return [];
  }
  const options = clientStore.neighborhoods || [];
  console.log('[ReusableForm] neighborhoodsOptions result:', options);
  return options;
});

// Computed property for screen size to prevent undefined errors
const isMobileScreen = computed(() => {
  console.log('[ReusableForm] isMobileScreen computed - checking...');
  console.log('[ReusableForm] $q exists:', !!$q);
  if (!$q) {
    console.warn('[ReusableForm] $q is undefined in isMobileScreen computed');
    return false;
  }
  console.log('[ReusableForm] $q.screen exists:', !!$q.screen);
  if (!$q.screen) {
    console.warn('[ReusableForm] $q.screen is undefined in isMobileScreen computed');
    return false;
  }
  console.log('[ReusableForm] $q.screen.xs exists:', $q.screen.xs !== undefined);
  const isMobile = $q.screen.xs || false;
  console.log('[ReusableForm] isMobileScreen result:', isMobile);
  return isMobile;
});

watch(
  () => formStreet,
  async (newValue) => {
    const form = props.form || client;
    if (form) {
      form.street_address = `${newValue.street} ${newValue.number}`;
    }
  },
  { deep: true }
);

watch(
  () => props.form?.zip_code || client?.zip_code,
  async (newZipCode) => {
    console.log('[ReusableForm] zip_code watch triggered, newZipCode:', newZipCode);
    console.log('[ReusableForm] clientStore in watch:', !!clientStore);
    console.log('[ReusableForm] clientStore.neighborhoods in watch:', clientStore?.neighborhoods);
    if (newZipCode && newZipCode.length === 5) {
      console.log('[ReusableForm] Valid zip code, fetching neighborhoods...');
      console.log('[ReusableForm] getNeighborhoods function exists:', typeof getNeighborhoods);
      showLoading("Consultando código postal ...");
      try {
        const formToUpdate = props.form || client;
        console.log('[ReusableForm] formToUpdate:', !!formToUpdate);
        if (formToUpdate) {
          formToUpdate.suburb_colonia = "";
        }
        console.log('[ReusableForm] Calling getNeighborhoods with:', newZipCode);
        const result = await getNeighborhoods(newZipCode);
        console.log('[ReusableForm] getNeighborhoods result:', result);
        console.log('[ReusableForm] Setting neighborhoodsFromZipCode.value to:', result);
        neighborhoodsFromZipCode.value = result;
        console.log('[ReusableForm] neighborhoodsFromZipCode.value after setting:', neighborhoodsFromZipCode.value);
        
        // Also update clientStore.neighborhoods
        console.log('[ReusableForm] Updating clientStore.neighborhoods');
        console.log('[ReusableForm] clientStore before update:', !!clientStore);
        if (clientStore) {
          console.log('[ReusableForm] clientStore.neighborhoods before assignment:', clientStore.neighborhoods);
          clientStore.neighborhoods = result;
          console.log('[ReusableForm] clientStore.neighborhoods after assignment:', clientStore.neighborhoods);
        } else {
          console.error('[ReusableForm] ERROR: clientStore is undefined when trying to update neighborhoods!');
        }
      } catch (error) {
        console.error('[ReusableForm] Error in zip_code watch:', error);
        console.error('[ReusableForm] Error stack:', error?.stack);
        neighborhoodsFromZipCode.value = [];
        if (clientStore) {
          clientStore.neighborhoods = [];
        }
      } finally {
        hideLoading();
      }
    }
  },
  { deep: true }
);

watch(
  () => solicitud.current_job_zip_code,
  async (newZipCode) => {
    if (newZipCode && newZipCode.length === 5) {
      showLoading("Consultando código postal ...");
      try {
        solicitud.current_job_suburb_colonia = "";
        const result = await getNeighborhoods(newZipCode);
        neighborhoodsJobFromZipCode.value = result;
      } catch (error) {
        neighborhoodsJobFromZipCode.value = [];
      } finally {
        hideLoading();
      }
    }
  },
  { deep: true }
);

watch(
  () => solicitud.fam_reference_zip_code,
  async (newZipCode) => {
    if (newZipCode && newZipCode.length === 5) {
      showLoading("Consultando código postal ...");
      try {
        solicitud.fam_reference_suburb_colonia = "";
        const result = await getNeighborhoods(newZipCode);
        neighborhoodsFamReferenceFromZipCode.value = result;
      } catch (error) {
        neighborhoodsFamReferenceFromZipCode.value = [];
      } finally {
        hideLoading();
      }
    }
  },
  { deep: true }
);

// Reset dependent fields when brand or model changes
watch(
  () => solicitud.brand_motorcycle,
  async (newBrand, oldBrand) => {
    if (
      newBrand !== oldBrand &&
      oldBrand != "" &&
      !motorcycleStore.hasDiscount
    ) {
      solicitud.model_motorcycle = "";
      solicitud.year_motorcycle = null;
      solicitud.invoice_motorcycle_value = "";
    }
    if (motorcycleStore.motorcycles.length == 0) {
      showLoading("Actualizando modelos...");
      try {
        await motorcycleStore.fetchMotorcycles();
      } finally {
        hideLoading();
      }
    }
  }
);

watch(
  () => solicitud.model_motorcycle,
  (newModel, oldModel) => {
    if (
      newModel !== oldModel &&
      oldModel != "" &&
      !motorcycleStore.hasDiscount
    ) {
      solicitud.year_motorcycle = null;
      solicitud.invoice_motorcycle_value = "";
    }
  }
);

watch(
  () => solicitud.year_motorcycle,
  () => {
    const result = motorcycleStore.motorcycles.find(
      (item) =>
        item.model === solicitud.model_motorcycle &&
        item.year === solicitud.year_motorcycle
    );
    if (motorcycleStore.hasDiscount) {
      solicitud.invoice_motorcycle_value =
        motorcycleStore.typeDiscount == "percentage"
          ? result.price * (1 - motorcycleStore.valueDiscount / 100)
          : result.price - motorcycleStore.valueDiscount;
    } else {
      solicitud.invoice_motorcycle_value = result ? result.price : null;
    }
  }
);

watch(
  () => solicitud.friend_reference_zip_code,
  async (newZipCode) => {
    if (newZipCode && newZipCode.length === 5) {
      showLoading("Consultando código postal ...");
      try {
        solicitud.friend_reference_suburb_colonia = "";
        const result = await getNeighborhoods(newZipCode);
        neighborhoodsFriendReferenceFromZipCode.value = result;
      } catch (error) {
        neighborhoodsFriendReferenceFromZipCode.value = [];
      } finally {
        hideLoading();
      }
    }
  },
  { deep: true }
);

// Initialize form model values for radio fields to prevent _withMods errors
// This must run before the component renders to ensure form values are defined
onMounted(() => {
  if (process.client) {
    props.fields.forEach((field) => {
      if (field.type === 'radio' && field.model) {
        // Ensure the form model has a value (even if null) to prevent Quasar errors
        if (!(field.model in props.form) || props.form[field.model] === undefined) {
          props.form[field.model] = null
        }
      }
    })
  }
})
</script>

<style scoped>
.custom-input {
  background-color: white;
  border-radius: 0.75rem;
  padding-left: 1.75rem;
  padding-right: 1.75rem;
  height: 75px;
  font-size: 16px;
}
.custom-loading {
  background-color: rgba(0, 0, 0, 1) !important;
  color: white !important;
}
.mobile-label .q-field__label {
  white-space: normal;
  font-size: 14px;
}

@media (max-width: 600px) {
  .mobile-label .q-field__label {
    font-size: 12px;
  }
}
</style>

