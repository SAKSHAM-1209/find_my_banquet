from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Banquet, BanquetImage
from .forms import SignUpForm, LoginForm, BanquetForm, ScheduleCallForm, ContactMessageForm
from .constants import KANPUR_AREAS  # ✅ Predefined areas

# ===== LANDING PAGE =====
def landing(request):
    banquets = Banquet.objects.all()
    area = request.GET.get('area')  
    guests = request.GET.get('guests')

    if area:
        banquets = banquets.filter(location__iexact=area)

    if guests:
        try:
            guests_int = int(guests)
            banquets = banquets.filter(capacity__gte=guests_int)
        except ValueError:
            pass

    context = {
        'banquets': banquets,
        'KANPUR_AREAS': KANPUR_AREAS
    }
    return render(request, 'landing.html', context)


# ===== ABOUT PAGE =====
def about(request):
    return render(request, 'about.html')


# ===== BANQUET PAGE =====
def banquet(request):
    banquets = Banquet.objects.all()
    return render(request, 'banquet.html', {'banquets': banquets})


# ===== SIGNUP =====
def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')

            # ✅ Check if user wants to list a venue
            venue_name = request.POST.get('venue_name')
            if venue_name:
                Banquet.objects.create(
                    owner_name=user.get_full_name() or user.username,
                    name=venue_name,
                    address=request.POST.get('venue_address'),
                    capacity=request.POST.get('venue_capacity') or 0,
                    price=request.POST.get('venue_price') or 0
                )
                messages.success(request, '✅ Your banquet has been registered successfully!')

            return redirect('landing')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = SignUpForm()
    
    return render(request, 'signup.html', {'form': form})


# ===== LOGIN =====
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request=request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, 'Logged in successfully!')
            return redirect('landing')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})


# ===== LOGOUT =====
def logout_view(request):
    logout(request)
    messages.info(request, 'Logged out successfully.')
    return redirect('landing')


# ===== BANQUET REGISTRATION =====


@login_required(login_url='login')  # agar user login nahi hai to login page pe redirect
def register_banquet(request):
    if request.method == 'POST':
        form = BanquetForm(request.POST)
        files = request.FILES.getlist('image')  # multiple images handle

        if form.is_valid():
            banquet = form.save(commit=False)
            banquet.owner_name = request.user.get_full_name() or request.user.username
            banquet.save()

            for f in files:
                BanquetImage.objects.create(banquet=banquet, image=f)

            messages.success(request, '✅ Banquet registered successfully with images!')
            return redirect('landing')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = BanquetForm()

    return render(request, 'register.html', {'form': form})





# ===== SCHEDULE CALL =====
def schedule_call(request):
    if request.method == 'POST':
        form = ScheduleCallForm(request.POST)
        if form.is_valid():
            call = form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': f"✅ Your call has been scheduled for {call.date} at {call.time_slot}."
                })
            messages.success(request, 'Your call has been scheduled!')
            return redirect('landing')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': form.errors.as_json()})
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ScheduleCallForm()
    return render(request, 'schedule-call.html', {'form': form})


# ===== CONTACT US =====
def contact_us(request):
    if request.method == 'POST':
        form = ContactMessageForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your message has been sent!')
            return redirect('landing')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ContactMessageForm()
    return render(request, 'contact.html', {'form': form})
