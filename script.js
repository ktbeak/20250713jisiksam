class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.showWelcomeMessage();
        this.initAOS();
    }

    initAOS() {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    bindEvents() {
        // 할일 추가
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 검색 기능
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.render();
        });
        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.searchQuery = '';
            this.render();
        });

        // 필터 버튼
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 카테고리 필터
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategory(e.target.dataset.category);
            });
        });

        // 액션 버튼
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('exportTodos').addEventListener('click', () => this.exportTodos());

        // Floating Action Button
        document.getElementById('fabMain').addEventListener('click', () => this.toggleFab());
        document.querySelectorAll('.fab-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.fab-option').dataset.action;
                this.handleFabAction(action);
            });
        });
    }

    toggleFab() {
        const fabButton = document.getElementById('fabMain');
        fabButton.classList.toggle('active');
    }

    handleFabAction(action) {
        switch (action) {
            case 'quick-add':
                this.showQuickAddModal();
                break;
            case 'search':
                document.getElementById('searchInput').focus();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    showQuickAddModal() {
        Swal.fire({
            title: '⚡ 빠른 할일 추가',
            input: 'text',
            inputPlaceholder: '할일을 입력하세요...',
            showCancelButton: true,
            confirmButtonText: '추가',
            cancelButtonText: '취소',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) {
                    return '할일을 입력해주세요!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.addQuickTodo(result.value);
            }
        });
    }

    addQuickTodo(text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            category: 'personal',
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();

        Swal.fire({
            title: '✅ 빠른 추가 완료!',
            text: `"${text}"이(가) 추가되었습니다.`,
            icon: 'success',
            confirmButtonText: '좋아요',
            confirmButtonColor: '#10b981',
            background: '#ecfdf5',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    showSettings() {
        Swal.fire({
            title: '⚙️ 설정',
            html: `
                <div class="text-start">
                    <h6>테마 설정</h6>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="theme" id="lightTheme" checked>
                        <label class="form-check-label" for="lightTheme">라이트 모드</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="theme" id="darkTheme">
                        <label class="form-check-label" for="darkTheme">다크 모드</label>
                    </div>
                    <hr>
                    <h6>알림 설정</h6>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enableNotifications" checked>
                        <label class="form-check-label" for="enableNotifications">알림 활성화</label>
                    </div>
                </div>
            `,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('✅ 설정이 저장되었습니다!', '', 'success');
            }
        });
    }

    showWelcomeMessage() {
        if (this.todos.length === 0) {
            Swal.fire({
                title: '🎉 Todo 앱에 오신 것을 환영합니다!',
                text: '첫 번째 할일을 추가해보세요.',
                icon: 'info',
                confirmButtonText: '시작하기',
                confirmButtonColor: '#6366f1',
                background: '#f8fafc',
                backdrop: `
                    rgba(0,0,123,0.4)
                    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%236366f1' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")
                `
            });
        }
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const categorySelect = document.getElementById('categorySelect');
        const text = input.value.trim();
        const category = categorySelect.value;
        
        if (text === '') {
            Swal.fire({
                title: '⚠️ 입력 오류',
                text: '할일을 입력해주세요!',
                icon: 'warning',
                confirmButtonText: '확인',
                confirmButtonColor: '#f59e0b',
                background: '#fef3c7',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            category: category,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.updateProgress();
        
        input.value = '';
        
        // 성공 알림
        Swal.fire({
            title: '✅ 할일 추가 완료!',
            text: `"${text}"이(가) 추가되었습니다.`,
            icon: 'success',
            confirmButtonText: '좋아요',
            confirmButtonColor: '#10b981',
            background: '#ecfdf5',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.updateProgress();
            
            // 토글 알림
            const message = todo.completed ? '완료되었습니다! 🎉' : '다시 진행중으로 변경되었습니다.';
            const icon = todo.completed ? 'success' : 'info';
            const color = todo.completed ? '#10b981' : '#6366f1';
            const bg = todo.completed ? '#ecfdf5' : '#eff6ff';
            
            Swal.fire({
                title: todo.completed ? '✅ 완료!' : '🔄 진행중',
                text: `"${todo.text}" ${message}`,
                icon: icon,
                confirmButtonText: '확인',
                confirmButtonColor: color,
                background: bg,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
        }
    }

    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        
        Swal.fire({
            title: '🗑️ 할일 삭제',
            text: `"${todo.text}"을(를) 삭제하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            background: '#fef2f2',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToStorage();
                this.render();
                this.updateStats();
                this.updateProgress();
                
                Swal.fire({
                    title: '✅ 삭제 완료',
                    text: '할일이 삭제되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#10b981',
                    background: '#ecfdf5',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
        
        // 필터 변경 알림
        const filterNames = {
            'all': '전체',
            'active': '진행중',
            'completed': '완료',
            'today': '오늘'
        };
        
        Swal.fire({
            title: `📋 ${filterNames[filter]} 보기`,
            text: `${filterNames[filter]} 할일만 표시됩니다.`,
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: '#6366f1',
            background: '#eff6ff',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    setCategory(category) {
        this.currentCategory = category;
        
        // 카테고리 버튼 활성화 상태 업데이트
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.render();
        
        // 카테고리 변경 알림
        const categoryNames = {
            'all': '전체',
            'personal': '개인',
            'work': '업무',
            'study': '학습',
            'health': '건강',
            'shopping': '쇼핑'
        };
        
        Swal.fire({
            title: `🏷️ ${categoryNames[category]} 카테고리`,
            text: `${categoryNames[category]} 할일만 표시됩니다.`,
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: '#6366f1',
            background: '#eff6ff',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    getFilteredTodos() {
        let filtered = this.todos;

        // 검색 필터
        if (this.searchQuery) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        // 상태 필터
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(todo => 
                    new Date(todo.createdAt).toDateString() === today
                );
                break;
        }

        // 카테고리 필터
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(todo => todo.category === this.currentCategory);
        }

        return filtered;
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            Swal.fire({
                title: '⚠️ 삭제할 항목 없음',
                text: '완료된 할일이 없습니다!',
                icon: 'warning',
                confirmButtonText: '확인',
                confirmButtonColor: '#f59e0b',
                background: '#fef3c7'
            });
            return;
        }
        
        Swal.fire({
            title: '🗑️ 완료된 항목 삭제',
            text: `${completedCount}개의 완료된 할일을 모두 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            background: '#fef3c7',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveToStorage();
                this.render();
                this.updateStats();
                this.updateProgress();
                
                Swal.fire({
                    title: '✅ 삭제 완료',
                    text: `${completedCount}개의 완료된 할일이 삭제되었습니다.`,
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#10b981',
                    background: '#ecfdf5'
                });
            }
        });
    }

    clearAll() {
        if (this.todos.length === 0) {
            Swal.fire({
                title: '⚠️ 삭제할 항목 없음',
                text: '삭제할 할일이 없습니다!',
                icon: 'warning',
                confirmButtonText: '확인',
                confirmButtonColor: '#f59e0b',
                background: '#fef3c7'
            });
            return;
        }
        
        Swal.fire({
            title: '⚠️ 전체 삭제',
            text: '모든 할일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '전체 삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            background: '#fef2f2',
            reverseButtons: true,
            dangerMode: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = [];
                this.saveToStorage();
                this.render();
                this.updateStats();
                this.updateProgress();
                
                Swal.fire({
                    title: '✅ 전체 삭제 완료',
                    text: '모든 할일이 삭제되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#10b981',
                    background: '#ecfdf5'
                });
            }
        });
    }

    exportTodos() {
        const data = {
            todos: this.todos,
            exportDate: new Date().toISOString(),
            totalCount: this.todos.length,
            completedCount: this.todos.filter(t => t.completed).length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Swal.fire({
            title: '✅ 내보내기 완료',
            text: '할일 목록이 JSON 파일로 다운로드되었습니다.',
            icon: 'success',
            confirmButtonText: '확인',
            confirmButtonColor: '#10b981',
            background: '#ecfdf5'
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;
        const today = new Date().toDateString();
        const todayCount = this.todos.filter(t => 
            new Date(t.createdAt).toDateString() === today
        ).length;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('remainingCount').textContent = remaining;
        document.getElementById('todayCount').textContent = todayCount;
        
        // 통계 업데이트 애니메이션
        this.animateNumbers();
    }

    updateProgress() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');

        progressBar.style.width = `${percentage}%`;
        progressPercent.textContent = `${percentage}%`;

        // 진행률에 따른 색상 변경
        if (percentage >= 80) {
            progressBar.style.background = 'linear-gradient(90deg, #10b981, #059669) !important';
        } else if (percentage >= 50) {
            progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706) !important';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626) !important';
        }
    }

    animateNumbers() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach(number => {
            const finalValue = parseInt(number.textContent);
            const startValue = 0;
            const duration = 1000;
            const increment = finalValue / (duration / 16);
            let currentValue = startValue;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                number.textContent = Math.floor(currentValue);
            }, 16);
        });
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const emptyMessages = {
                'all': { icon: '📝', text: '할일을 추가해보세요!' },
                'active': { icon: '⏰', text: '진행중인 할일이 없습니다!' },
                'completed': { icon: '✅', text: '완료된 할일이 없습니다!' },
                'today': { icon: '📅', text: '오늘의 할일이 없습니다!' }
            };
            
            const message = emptyMessages[this.currentFilter] || emptyMessages['all'];
            
            todoList.innerHTML = `
                <li class="list-group-item">
                    <div class="empty-state">
                        <h3>${message.icon}</h3>
                        <p>${message.text}</p>
                    </div>
                </li>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => {
            const categoryNames = {
                'personal': '개인',
                'work': '업무',
                'study': '학습',
                'health': '건강',
                'shopping': '쇼핑'
            };

            const highlightedText = this.searchQuery 
                ? this.highlightText(todo.text, this.searchQuery)
                : todo.text;

            return `
                <li class="list-group-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <div class="todo-item">
                        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="todo-text">${highlightedText}</span>
                        <span class="todo-category ${todo.category}">${categoryNames[todo.category]}</span>
                        <button class="todo-delete btn btn-sm">
                            <i class="fas fa-trash me-1"></i>삭제
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        // 이벤트 리스너 추가
        todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('.list-group-item').dataset.id);
                this.toggleTodo(id);
            });
        });

        todoList.querySelectorAll('.todo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.list-group-item').dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// SweetAlert2 설정
Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 