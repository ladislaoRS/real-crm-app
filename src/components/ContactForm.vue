<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- First name -->
        <div>
          <q-input
            v-model="form.first_name"
            label="First name"
            class="w-full"
            :rules="[(val) => !!val || 'First name is required']"
            :error="!!errors.first_name"
            :error-message="errors.first_name"
            outlined
          />
        </div>

        <!-- Last name -->
        <div>
          <q-input
            v-model="form.last_name"
            label="Last name"
            class="w-full"
            :rules="[(val) => !!val || 'Last name is required']"
            :error="!!errors.last_name"
            :error-message="errors.last_name"
            outlined
          />
        </div>

        <!-- Organization (would need to be a dynamic select in a real app) -->
        <div>
          <q-select
            v-model="form.organization_id"
            :options="organizationOptions"
            label="Organization"
            class="w-full"
            outlined
            emit-value
            map-options
            :error="!!errors.organization_id"
            :error-message="errors.organization_id"
          />
        </div>

        <!-- Email -->
        <div>
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            class="w-full"
            :rules="[(val) => !val || isValidEmail(val) || 'Please enter a valid email']"
            :error="!!errors.email"
            :error-message="errors.email"
            outlined
          />
        </div>

        <!-- Phone -->
        <div>
          <q-input
            v-model="form.phone"
            label="Phone"
            class="w-full"
            :error="!!errors.phone"
            :error-message="errors.phone"
            outlined
          />
        </div>

        <!-- Address -->
        <div class="md:col-span-2">
          <q-input
            v-model="form.address"
            label="Address"
            class="w-full"
            :error="!!errors.address"
            :error-message="errors.address"
            outlined
          />
        </div>

        <!-- City -->
        <div>
          <q-input
            v-model="form.city"
            label="City"
            class="w-full"
            :error="!!errors.city"
            :error-message="errors.city"
            outlined
          />
        </div>

        <!-- Region -->
        <div>
          <q-input
            v-model="form.region"
            label="State/Province"
            class="w-full"
            :error="!!errors.region"
            :error-message="errors.region"
            outlined
          />
        </div>

        <!-- Country -->
        <div>
          <q-input
            v-model="form.country"
            label="Country"
            class="w-full"
            :error="!!errors.country"
            :error-message="errors.country"
            outlined
          />
        </div>

        <!-- Postal code -->
        <div>
          <q-input
            v-model="form.postal_code"
            label="Postal code"
            class="w-full"
            :error="!!errors.postal_code"
            :error-message="errors.postal_code"
            outlined
          />
        </div>
      </div>

      <!-- Form actions -->
      <div class="flex justify-end space-x-3 mt-8">
        <q-btn flat label="Cancel" @click="$emit('cancel')" :disable="loading" />
        <q-btn type="submit" color="primary" :label="submitLabel" :loading="loading" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from 'vue'

const props = defineProps({
  contact: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Save',
  },
  // Typically these would be fetched from the API but we'll use props for now
  organizations: {
    type: Array,
    default: () => [
      { id: 1, name: 'Acme Inc.' },
      { id: 2, name: 'Widget Co.' },
      { id: 3, name: 'Example Corp.' },
    ],
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Form state
const form = ref({
  first_name: '',
  last_name: '',
  organization_id: null,
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  country: '',
  postal_code: '',
})

// Errors state
const errors = ref({})

// Map organizations for q-select
const organizationOptions = props.organizations.map((org) => ({
  label: org.name,
  value: org.id,
}))

// Fill the form with existing contact data if provided
watchEffect(() => {
  if (props.contact && Object.keys(props.contact).length > 0) {
    form.value = {
      first_name: props.contact.first_name || '',
      last_name: props.contact.last_name || '',
      organization_id: props.contact.organization_id || null,
      email: props.contact.email || '',
      phone: props.contact.phone || '',
      address: props.contact.address || '',
      city: props.contact.city || '',
      region: props.contact.region || '',
      country: props.contact.country || '',
      postal_code: props.contact.postal_code || '',
    }
  }
})

// Validation helper
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Form submission
const onSubmit = () => {
  // Reset errors
  errors.value = {}

  // Basic validation
  if (!form.value.first_name) {
    errors.value.first_name = 'First name is required'
  }

  if (!form.value.last_name) {
    errors.value.last_name = 'Last name is required'
  }

  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }

  // If there are no errors, emit the form data
  if (Object.keys(errors.value).length === 0) {
    emit('submit', { ...form.value })
  }
}
</script>
