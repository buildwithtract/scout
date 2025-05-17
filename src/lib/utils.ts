import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hectaresToAcres(hectares: number): number {
  return hectares * 2.47105
}

export function acresToHectares(acres: number): number {
  return acres / 2.47105
}
