import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { BuilderComponent, Builder, builder } from '@builder.io/react'
import builderConfig from '@config/builder'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { Link } from '@components/Link/Link'
import { getTargetingValues } from '@builder.io/personalization-utils'

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ path: string[] }>) {
  const isPersonalizedRequest = params?.path?.[0].startsWith(';')
  const urlPath = '/' + (params?.path?.join('/') || '')

  const targeting = isPersonalizedRequest
    ? getTargetingValues(params!.path[0].split(';').slice(1))
    : { urlPath }

  const page =
    (await builder
      .get('page', {
        apiKey: builderConfig.apiKey,
        userAttributes: targeting,
        cachebust: true,
      })
      .toPromise()) || null

  return {
    props: {
      page,
      targeting,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 15,
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export default function Path({
  page,
  targeting,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  const isLive = !Builder.isEditing && !Builder.isPreviewing
  if (!page && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    )
  }

  const { title, description, image } = page?.data! || {}

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: 'website',
          title,
          description,
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              alt: title,
            },
          ],
        }}
      />
      <BuilderComponent
        context={{ targeting }}
        renderLink={Link}
        model="page"
        content={page}
      />
    </>
  )
}