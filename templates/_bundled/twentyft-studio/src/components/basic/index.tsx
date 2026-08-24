/**
 * Registered basic HTML wrapper components for G7 JSON Layout.
 *
 * These wrappers replace raw lowercase HTML tag names (`div`, `section`, etc.)
 * with registered component names (`Div`, `Section`, etc.) so that layouts
 * only reference components declared in components.json.
 */

import React from 'react';

export function Div(props: React.ComponentPropsWithoutRef<'div'>): React.ReactElement {
    return <div {...props} />;
}

export function Main(props: React.ComponentPropsWithoutRef<'main'>): React.ReactElement {
    return <main {...props} />;
}

export function Header(props: React.ComponentPropsWithoutRef<'header'>): React.ReactElement {
    return <header {...props} />;
}

export function Footer(props: React.ComponentPropsWithoutRef<'footer'>): React.ReactElement {
    return <footer {...props} />;
}

export function Nav(props: React.ComponentPropsWithoutRef<'nav'>): React.ReactElement {
    return <nav {...props} />;
}

export function Section(props: React.ComponentPropsWithoutRef<'section'>): React.ReactElement {
    return <section {...props} />;
}

export function Article(props: React.ComponentPropsWithoutRef<'article'>): React.ReactElement {
    return <article {...props} />;
}

export function Aside(props: React.ComponentPropsWithoutRef<'aside'>): React.ReactElement {
    return <aside {...props} />;
}

export function Span(props: React.ComponentPropsWithoutRef<'span'>): React.ReactElement {
    return <span {...props} />;
}

export function P(props: React.ComponentPropsWithoutRef<'p'>): React.ReactElement {
    return <p {...props} />;
}

export function H1(props: React.ComponentPropsWithoutRef<'h1'>): React.ReactElement {
    return <h1 {...props} />;
}

export function H2(props: React.ComponentPropsWithoutRef<'h2'>): React.ReactElement {
    return <h2 {...props} />;
}

export function H3(props: React.ComponentPropsWithoutRef<'h3'>): React.ReactElement {
    return <h3 {...props} />;
}

export function H4(props: React.ComponentPropsWithoutRef<'h4'>): React.ReactElement {
    return <h4 {...props} />;
}

export function A(props: React.ComponentPropsWithoutRef<'a'>): React.ReactElement {
    return <a {...props} />;
}

export function Button(props: React.ComponentPropsWithoutRef<'button'>): React.ReactElement {
    return <button {...props} />;
}

export function Img(props: React.ComponentPropsWithoutRef<'img'>): React.ReactElement {
    return <img {...props} />;
}

export function Ul(props: React.ComponentPropsWithoutRef<'ul'>): React.ReactElement {
    return <ul {...props} />;
}

export function Ol(props: React.ComponentPropsWithoutRef<'ol'>): React.ReactElement {
    return <ol {...props} />;
}

export function Li(props: React.ComponentPropsWithoutRef<'li'>): React.ReactElement {
    return <li {...props} />;
}

export function Form(props: React.ComponentPropsWithoutRef<'form'>): React.ReactElement {
    return <form {...props} />;
}

export function Label(props: React.ComponentPropsWithoutRef<'label'>): React.ReactElement {
    return <label {...props} />;
}

export function Input(props: React.ComponentPropsWithoutRef<'input'>): React.ReactElement {
    return <input {...props} />;
}

export function Textarea(props: React.ComponentPropsWithoutRef<'textarea'>): React.ReactElement {
    return <textarea {...props} />;
}

export function Select(props: React.ComponentPropsWithoutRef<'select'>): React.ReactElement {
    return <select {...props} />;
}

export function Option(props: React.ComponentPropsWithoutRef<'option'>): React.ReactElement {
    return <option {...props} />;
}
