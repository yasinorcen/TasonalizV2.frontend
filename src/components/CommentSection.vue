<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { apiFetch } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { CommentItem } from '@/types/api'
import { formatDateTime } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    companyCode: string
    targetType?: 'COMPANY' | 'FINANCIAL_TABLE'
    statementType?: '' | 'BILANCO' | 'GELIR' | 'NAKIT'
    period?: string
    sectionTitle?: string
  }>(),
  {
    targetType: 'COMPANY',
    statementType: '',
    period: '',
    sectionTitle: 'Kullanıcı Yorumları ve Değerlendirmeler',
  }
)

const authStore = useAuthStore()
const comments = ref<CommentItem[]>([])
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const newContent = ref('')
const submitting = ref(false)
const submitError = ref<string | null>(null)

const editingId = ref<number | null>(null)
const editContent = ref('')
const editSaving = ref(false)

async function fetchComments() {
  loading.value = true
  errorMsg.value = null
  try {
    const params = new URLSearchParams({
      company: props.companyCode,
      target_type: props.targetType,
    })
    if (props.statementType) {
      params.set('statement_type', props.statementType)
    }
    if (props.period) {
      params.set('period', props.period)
    }
    comments.value = await apiFetch<CommentItem[]>(
      `/comments/?${params.toString()}`
    )
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message : 'Yorumlar yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

async function handleCreateComment() {
  const trimmed = newContent.value.trim()
  if (trimmed.length < 3) {
    submitError.value = 'Yorum metni en az 3 karakter olmalıdır.'
    return
  }
  submitting.value = true
  submitError.value = null
  try {
    const created = await apiFetch<CommentItem>('/comments/', {
      method: 'POST',
      body: JSON.stringify({
        company_code: props.companyCode,
        target_type: props.targetType,
        statement_type: props.statementType,
        period: props.period,
        content: trimmed,
      }),
    })
    comments.value.unshift(created)
    newContent.value = ''
  } catch (err) {
    submitError.value =
      err instanceof Error ? err.message : 'Yorum kaydedilirken bir hata oluştu.'
  } finally {
    submitting.value = false
  }
}

function startEditing(item: CommentItem) {
  editingId.value = item.id
  editContent.value = item.content
}

function cancelEditing() {
  editingId.value = null
  editContent.value = ''
}

async function saveEdit(commentId: number) {
  const trimmed = editContent.value.trim()
  if (trimmed.length < 3) return
  editSaving.value = true
  try {
    const updated = await apiFetch<CommentItem>(`/comments/${commentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ content: trimmed }),
    })
    const idx = comments.value.findIndex((c) => c.id === commentId)
    if (idx !== -1) {
      comments.value[idx] = updated
    }
    editingId.value = null
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Yorum güncellenirken bir hata oluştu.'
    )
  } finally {
    editSaving.value = false
  }
}

async function deleteComment(commentId: number) {
  if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
  try {
    await apiFetch<void>(`/comments/${commentId}/`, {
      method: 'DELETE',
    })
    comments.value = comments.value.filter((c) => c.id !== commentId)
  } catch (err) {
    alert(
      err instanceof Error ? err.message : 'Yorum silinirken bir hata oluştu.'
    )
  }
}

onMounted(fetchComments)

watch(
  () => [props.companyCode, props.targetType, props.statementType, props.period],
  () => {
    fetchComments()
  }
)
</script>

<template>
  <section class="comment-section card">
    <div class="comment-header">
      <div>
        <h3 class="section-title" style="margin-block-end: 0.2rem">
          {{ sectionTitle }}
        </h3>
        <p class="comment-subtitle">
          <template v-if="targetType === 'FINANCIAL_TABLE'">
            <strong>{{ companyCode }}</strong> —
            {{
              statementType === 'BILANCO'
                ? 'Bilanço'
                : statementType === 'GELIR'
                  ? 'Gelir Tablosu'
                  : 'Nakit Akış Tablosu'
            }}
            <span v-if="period">({{ period }} Dönemi)</span> inceleme notları
          </template>
          <template v-else>
            <strong>{{ companyCode }}</strong> hisse ve şirket sayfası için topluluk
            yorumları
          </template>
        </p>
      </div>
      <span class="badge badge-neutral">{{ comments.length }} Yorum</span>
    </div>

    <!-- Comment Form for Authenticated Users -->
    <form
      v-if="authStore.isAuthenticated"
      class="comment-form"
      @submit.prevent="handleCreateComment"
    >
      <label :for="`comment-input-${companyCode}-${statementType}`" class="sr-only">
        Yorumunuzu yazın
      </label>
      <textarea
        :id="`comment-input-${companyCode}-${statementType}`"
        v-model="newContent"
        rows="3"
        maxlength="2000"
        class="textarea"
        placeholder="Şirket veya finansal tablo verileri hakkındaki kişisel analiz ve değerlendirmenizi paylaşın (Yatırım tavsiyesi niteliği taşımamalıdır)..."
        required
      ></textarea>
      <div class="comment-form-footer">
        <span class="char-counter">{{ newContent.length }} / 2000 karakter</span>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Gönderiliyor...' : 'Yorum Ekle' }}
        </button>
      </div>
      <p v-if="submitError" class="error-inline">{{ submitError }}</p>
    </form>

    <div v-else class="state-box" style="margin-block-end: 1.25rem">
      Bu sayfaya kendi yorumunuzu ve finansal tablo notunuzu eklemek için lütfen
      <RouterLink to="/hesap"><strong>Giriş Yapın veya Hesap Oluşturun</strong></RouterLink>.
    </div>

    <!-- Loading / Error / Empty / List -->
    <div v-if="loading" class="state-box">Yorumlar yükleniyor...</div>
    <div v-else-if="errorMsg" class="state-box state-box-error">
      {{ errorMsg }}
    </div>
    <div v-else-if="comments.length === 0" class="state-box">
      Henüz bu bölüm için yorum eklenmemiş. İlk değerlendirmeyi siz ekleyebilirsiniz.
    </div>

    <div v-else class="comment-list">
      <article v-for="item in comments" :key="item.id" class="comment-item">
        <div class="comment-item-meta">
          <div class="author-info">
            <strong class="author-name">👤 {{ item.author_username }}</strong>
            <span v-if="item.statement_type" class="badge badge-accent">
              {{ item.statement_type }} {{ item.period ? `· ${item.period}` : '' }}
            </span>
            <span v-if="item.is_edited" class="edited-tag" title="Yazar tarafından düzenlendi">
              (düzenlendi)
            </span>
          </div>
          <time :datetime="item.created_at" class="comment-date">
            {{ formatDateTime(item.created_at) }}
          </time>
        </div>

        <div v-if="editingId === item.id" class="edit-box">
          <textarea
            v-model="editContent"
            rows="3"
            maxlength="2000"
            class="textarea"
          ></textarea>
          <div class="edit-actions">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              :disabled="editSaving"
              @click="saveEdit(item.id)"
            >
              {{ editSaving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
            <button
              type="button"
              class="btn btn-sm"
              @click="cancelEditing"
            >
              İptal
            </button>
          </div>
        </div>
        <p v-else class="comment-body">{{ item.content }}</p>

        <div v-if="item.is_owner && editingId !== item.id" class="owner-actions">
          <button
            type="button"
            class="btn btn-sm"
            @click="startEditing(item)"
          >
            Düzenle
          </button>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            @click="deleteComment(item.id)"
          >
            Sil
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-block-end: 1rem;
}

.comment-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.comment-form {
  margin-block-end: 1.5rem;
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-start: 0.5rem;
}

.char-counter {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.error-inline {
  color: var(--negative-text);
  font-size: 0.86rem;
  margin: 0.5rem 0 0 0;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.comment-item {
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
}

.comment-item-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-block-end: 0.55rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.author-name {
  font-size: 0.92rem;
}

.edited-tag {
  font-size: 0.78rem;
  font-style: italic;
  color: var(--text-muted);
}

.comment-date {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.comment-body {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.94rem;
}

.owner-actions,
.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-block-start: 0.65rem;
}
</style>
