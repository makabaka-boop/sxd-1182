import { ref } from 'vue'

export function useDrag() {
  const draggedItem = ref<any | null>(null)
  const dragOverIndex = ref<number | null>(null)
  const draggedIndex = ref<number | null>(null)

  const onDragStart = (item: any, index: number) => {
    draggedItem.value = item
    draggedIndex.value = index
  }

  const onDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    dragOverIndex.value = index
  }

  const onDragLeave = () => {
    dragOverIndex.value = null
  }

  const onDrop = <T>(list: T[], updateList: (newList: T[]) => void) => {
    if (draggedIndex.value === null || dragOverIndex.value === null) {
      onDragEnd()
      return
    }
    const newList = [...list]
    const [removed] = newList.splice(draggedIndex.value, 1)
    newList.splice(dragOverIndex.value, 0, removed)
    updateList(newList)
    onDragEnd()
  }

  const onDragEnd = () => {
    draggedItem.value = null
    draggedIndex.value = null
    dragOverIndex.value = null
  }

  return {
    draggedItem,
    draggedIndex,
    dragOverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  }
}
