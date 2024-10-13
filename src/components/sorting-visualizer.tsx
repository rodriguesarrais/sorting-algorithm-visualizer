'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type SortingAlgorithm = 'quicksort' | 'bubblesort' | 'bogosort' | 'mergesort' | 'insertionsort' | 'selectionsort'
type Page = 'visualizer' | 'about'

export function SortingVisualizerComponent() {
  const [array, setArray] = useState<number[]>([])
  const [sorting, setSorting] = useState(false)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('quicksort')
  const [currentPage, setCurrentPage] = useState<Page>('visualizer')
  const [isMuted, setIsMuted] = useState(false)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const sortingRef = useRef(false)

  useEffect(() => {
    resetArray()
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const resetArray = () => {
    const newArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 1)
    setArray(newArray)
    setSorting(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const playSound = (frequency: number) => {
    if (isMuted || !audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1)

    oscillator.start()
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }

  const startSorting = () => {
    setSorting(true)
    sortingRef.current = true
    switch (algorithm) {
      case 'quicksort':
        quickSort(array.slice(), 0, array.length - 1)
        break
      case 'bubblesort':
        bubbleSort(array.slice())
        break
      case 'bogosort':
        bogoSort(array.slice())
        break
      case 'mergesort':
        mergeSort(array.slice(), 0, array.length - 1)
        break
      case 'insertionsort':
        insertionSort(array.slice())
        break
      case 'selectionsort':
        selectionSort(array.slice())
        break
    }
  }

  const stopSorting = () => {
    setSorting(false)
    sortingRef.current = false
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const quickSort = async (arr: number[], low: number, high: number) => {
    if (low < high && sortingRef.current) {
      const pivotIndex = await partition(arr, low, high)
      await quickSort(arr, low, pivotIndex - 1)
      await quickSort(arr, pivotIndex + 1, high)
    }
  }

  const partition = async (arr: number[], low: number, high: number): Promise<number> => {
    const pivot = arr[high]
    let i = low - 1

    for (let j = low; j < high && sortingRef.current; j++) {
      if (arr[j] < pivot) {
        i++
        await swap(arr, i, j)
      }
    }
    if (sortingRef.current) {
      await swap(arr, i + 1, high)
    }
    return i + 1
  }

  const bubbleSort = async (arr: number[]) => {
    const n = arr.length
    for (let i = 0; i < n - 1 && sortingRef.current; i++) {
      for (let j = 0; j < n - i - 1 && sortingRef.current; j++) {
        if (arr[j] > arr[j + 1]) {
          await swap(arr, j, j + 1)
        }
      }
    }
  }

  const bogoSort = async (arr: number[]) => {
    while (!isSorted(arr) && sortingRef.current) {
      await shuffle(arr)
    }
  }

  const mergeSort = async (arr: number[], left: number, right: number) => {
    if (left < right && sortingRef.current) {
      const mid = Math.floor((left + right) / 2)
      await mergeSort(arr, left, mid)
      await mergeSort(arr, mid + 1, right)
      await new Promise(resolve => setTimeout(resolve, 50))
      await merge(arr, left, mid, right)
    }
  }

  const merge = async (arr: number[], left: number, mid: number, right: number) => {
    const n1 = mid - left + 1
    const n2 = right - mid
    const L = arr.slice(left, mid + 1)
    const R = arr.slice(mid + 1, right + 1)

    let i = 0, j = 0, k = left

    while (i < n1 && j < n2 && sortingRef.current) {
      if (L[i] <= R[j]) {
        arr[k] = L[i]
        i++
      } else {
        arr[k] = R[j]
        j++
      }
      await updateArray(arr)
      k++
    }

    while (i < n1 && sortingRef.current) {
      arr[k] = L[i]
      i++
      k++
      await updateArray(arr)
    }

    while (j < n2 && sortingRef.current) {
      arr[k] = R[j]
      j++
      k++
      await updateArray(arr)
    }
  }

  const insertionSort = async (arr: number[]) => {
    for (let i = 1; i < arr.length && sortingRef.current; i++) {
      let key = arr[i]
      let j = i - 1

      while (j >= 0 && arr[j] > key && sortingRef.current) {
        arr[j + 1] = arr[j]
        await updateArray(arr)
        j--
      }
      arr[j + 1] = key
      await updateArray(arr)
    }
  }

  const selectionSort = async (arr: number[]) => {
    for (let i = 0; i < arr.length - 1 && sortingRef.current; i++) {
      let minIdx = i
      for (let j = i + 1; j < arr.length && sortingRef.current; j++) {
        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }
      if (minIdx !== i) {
        await swap(arr, i, minIdx)
      }
    }
  }

  const isSorted = (arr: number[]): boolean => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1] > arr[i]) return false
    }
    return true
  }

  const shuffle = async (arr: number[]) => {
    for (let i = arr.length - 1; i > 0 && sortingRef.current; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      await swap(arr, i, j)
    }
  }

  const swap = async (arr: number[], i: number, j: number) => {
    await new Promise(resolve => setTimeout(resolve, 50))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
    await updateArray(arr)
  }

  const updateArray = async (arr: number[]) => {
    setArray([...arr])
    playSound(200 + arr[arr.length - 1] * 5)
  }

  const renderVisualizer = () => (
    <>
      <div className="flex space-x-4 mb-8">
        <Select value={algorithm} onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)}>
          <SelectTrigger className="w-[180px] bg-white bg-opacity-50 backdrop-blur-md border-pink-300 text-pink-700">
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quicksort">QuickSort</SelectItem>
            <SelectItem value="bubblesort">BubbleSort</SelectItem>
            <SelectItem value="bogosort">BogoSort</SelectItem>
            <SelectItem value="mergesort">MergeSort</SelectItem>
            <SelectItem value="insertionsort">InsertionSort</SelectItem>
            <SelectItem value="selectionsort">SelectionSort</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={startSorting} 
          disabled={sorting}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Start Sorting
        </Button>
        <Button 
          onClick={stopSorting} 
          disabled={!sorting}
          className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Stop Sorting
        </Button>
        <Button 
          onClick={resetArray} 
          variant="outline"
          className="border-2 border-pink-500 text-pink-700 font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Reset Array
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="mute-switch"
            checked={!isMuted}
            onCheckedChange={(checked) => setIsMuted(!checked)}
          />
          <Label htmlFor="mute-switch">Sound {isMuted ? 'Off' : 'On'}</Label>
        </div>
      </div>
      <div className="relative w-[800px] h-[400px] rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-300 opacity-50"></div>
        <svg width="800" height="400" className="relative z-10">
          {array.map((value, index) => (
            <rect
              key={index}
              x={index * (800 / 50)}
              y={400 - (value / 100) * 400}
              width={800 / 50 - 1}
              height={(value / 100) * 400}
              fill="rgba(219, 39, 119, 0.8)"
              className="transition-all duration-300 ease-in-out"
            />
          ))}
        </svg>
      </div>
    </>
  )

  const renderAbout = () => (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-pink-600">About the Project</h2>
      <p className="mb-4">
        This Sorting Algorithm Visualizer was created as an interactive tool to demonstrate how different sorting algorithms work. The project was developed using React and Next.js, with Tailwind CSS for styling.
      </p>
      <h3 className="text-2xl font-semibold mb-2 text-pink-500">Development Process</h3>
      <ol className="list-decimal list-inside space-y-2 mb-4">
        <li>First, i implemented a bunch of sorting algorithms: QuickSort, BubbleSort, BogoSort, MergeSort, InsertionSort and SelectionSort, to be precise;</li>
        <li>Then, i created the visualization using SVG rectangles;</li>
        <li>Added user controls for algorithm selection and sorting actions;</li>
        <li>Styled the component with a vibrant, gradient-based design</li>
        <li>Added responsive design and accessibility features</li>
        <li>Integrated sound effects using the web audio API</li>
        <li>Finally, just to apply the icing on the cake, i added smooth transitions between pages using framer motion.</li>
      </ol>
      <p className="mb-4">
        The project showcases my skills at both algorithms and web design, as it was intended from the beggining. Enjoy!!! ^-^
      </p>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 p-8">
      <nav className="w-full max-w-4xl mb-8">
        <ul className="flex justify-center space-x-4">
          <li>
            <Button
              onClick={() => setCurrentPage('visualizer')}
              variant={currentPage === 'visualizer' ? 'default' : 'outline'}
              className="font-semibold"
            >
              Visualizer
            </Button>
          </li>
          <li>
            <Button
              onClick={() => setCurrentPage('about')}
              variant={currentPage === 'about' ? 'default' : 'outline'}
              className="font-semibold"
            >
              About the Project
            </Button>
          </li>
        </ul>
      </nav>
      <h1 className="text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse">
        Sorting Algorithm Visualizer
      </h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentPage === 'visualizer' ? renderVisualizer() : renderAbout()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}