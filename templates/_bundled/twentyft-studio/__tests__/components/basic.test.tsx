import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
    A,
    Article,
    Aside,
    Button,
    Div,
    Form,
    Footer,
    H1,
    H2,
    H3,
    H4,
    Header,
    Img,
    Input,
    Label,
    Li,
    Main,
    Nav,
    Ol,
    Option,
    P,
    Section,
    Select,
    Span,
    Textarea,
    Ul,
} from '../../src/components/basic';

describe('basic HTML wrappers', () => {
    it('renders the matching semantic HTML element for each wrapper', () => {
        const { container } = render(
            <Div>
                <Header>header</Header>
                <Main>main</Main>
                <Footer>footer</Footer>
                <Nav>nav</Nav>
                <Section>section</Section>
                <Article>article</Article>
                <Aside>aside</Aside>
                <Span>span</Span>
                <P>p</P>
                <H1>h1</H1>
                <H2>h2</H2>
                <H3>h3</H3>
                <H4>h4</H4>
                <A href="/">a</A>
                <Button type="button">button</Button>
                <Img src="/x.png" alt="img" />
                <Ul>
                    <Li>li</Li>
                </Ul>
                <Ol>
                    <Li>li</Li>
                </Ol>
                <Form>
                    <Label htmlFor="x">label</Label>
                    <Input id="x" />
                    <Select>
                        <Option>option</Option>
                    </Select>
                    <Textarea />
                </Form>
            </Div>
        );

        expect(container.querySelector('div')).toBeInTheDocument();
        expect(container.querySelector('header')).toHaveTextContent('header');
        expect(container.querySelector('main')).toHaveTextContent('main');
        expect(container.querySelector('footer')).toHaveTextContent('footer');
        expect(container.querySelector('nav')).toHaveTextContent('nav');
        expect(container.querySelector('section')).toHaveTextContent('section');
        expect(container.querySelector('article')).toHaveTextContent('article');
        expect(container.querySelector('aside')).toHaveTextContent('aside');
        expect(container.querySelector('span')).toHaveTextContent('span');
        expect(container.querySelector('p')).toHaveTextContent('p');
        expect(container.querySelector('h1')).toHaveTextContent('h1');
        expect(container.querySelector('h2')).toHaveTextContent('h2');
        expect(container.querySelector('h3')).toHaveTextContent('h3');
        expect(container.querySelector('h4')).toHaveTextContent('h4');
        expect(container.querySelector('a')).toHaveAttribute('href', '/');
        expect(container.querySelector('button')).toHaveAttribute('type', 'button');
        expect(container.querySelector('img')).toHaveAttribute('alt', 'img');
        expect(container.querySelectorAll('li')).toHaveLength(2);
        expect(container.querySelector('form')).toBeInTheDocument();
        expect(container.querySelector('label')).toHaveAttribute('for', 'x');
        expect(container.querySelector('input')).toHaveAttribute('id', 'x');
        expect(container.querySelector('select')).toBeInTheDocument();
        expect(container.querySelector('option')).toHaveTextContent('option');
        expect(container.querySelector('textarea')).toBeInTheDocument();
    });
});
