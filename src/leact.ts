import { useState, useRef, useEffect, useLayoutEffect } from './hook'
import { render } from './workloop'
import { createElement, createFragment, Fragment } from './fiber'

export default {
    render,
    useState,
    createElement,
    useRef,
    useEffect,
    useLayoutEffect,
    createFragment,
    Fragment,
}