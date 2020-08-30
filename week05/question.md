> 为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？
>
> first-letter 是在布局完成之后，确定了一段文字中的第一个文字，可以对其操作布局时性能开销小；
> 而 first-line 选中的是第一行文字，不同的宽度选中的文字内容不一样，要对其重新布局排版消耗性能大,所以 first-letter 可以设置 float 之类的，而 first-line 不行。
