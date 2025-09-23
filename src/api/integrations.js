function ensureFileObject(input) {
  if (!input) return null;
  if (input instanceof File) return input;
  if (typeof input === 'object' && input.file instanceof File) {
    return input.file;
  }
  return null;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function UploadFile(input) {
  const file = ensureFileObject(input);
  if (!file) {
    throw new Error('Nenhum ficheiro recebido para upload.');
  }

  const fileUrl = await fileToDataUrl(file);
  return {
    file_url: fileUrl,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
  };
}

export async function SendEmail(payload) {
  console.info('[SendEmail] Placeholder implementation', payload);
  return { status: 'queued' };
}

export async function GenerateImage() {
  throw new Error('Geração de imagens não está configurada neste ambiente.');
}

export async function ExtractDataFromUploadedFile() {
  throw new Error('Extração de dados não está configurada neste ambiente.');
}

export async function CreateFileSignedUrl() {
  throw new Error('Criação de URL assinada não está configurada neste ambiente.');
}

export async function UploadPrivateFile(input) {
  return UploadFile(input);
}

export async function InvokeLLM() {
  throw new Error('Integração LLM não está configurada neste ambiente.');
}
