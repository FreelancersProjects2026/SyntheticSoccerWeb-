import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useParallaxScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targetRef.current,
        { scale: 0.9, y: 20 },
        {
          scale: 1.04,
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return { sectionRef, targetRef }
}

export function useWordScrub() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!titleRef.current) return
      titleRef.current.querySelectorAll('span').forEach((word) => {
        gsap.fromTo(word, { opacity: 0.12 }, {
          opacity: 1,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            end: 'top 15%',
            scrub: 1.5,
          },
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return { containerRef, titleRef }
}

export function useStaggerEntrance(selector: string) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      containerRef.current?.querySelectorAll(selector).forEach((item, i) => {
        gsap.fromTo(item, { y: 60, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 87%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.12,
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return { containerRef }
}
